const express = require("express")
const authenticateUser = require("../middleware/auth");
const Chore = require('../models/chores/chore')
const User = require('../models/user');
const ChoresUser = require('../models/chores/choresUser');
const { logger } = require("../middleware/logging");
const {
  validateIntervalData,
} = require('../lib/intervalUtils');

const { sendPushNotifications } = require('../services/notificationService');

const router = express.Router();


// Chores

router.get('/', authenticateUser, async (req, res) => {
  try {
    const filters = {};

    if (req.query.userInvolved) {
      const user = await User.findOne({ displayName: req.query.userInvolved });
      if (user) {
        filters.$or = [
          { ownerId: user._id },
          { 'usersList.displayName': req.query.userInvolved }
        ];
      }
    }
    else if (res.authUser && res.authUser.displayName) {
      filters.ownerId = res.authUser._id;
    }

    if (req.query.finished !== undefined) {
      filters.finished = req.query.finished === 'true';
    }

    const chores = await Chore.find(filters);
    res.status(200).json(chores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:displayName', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ displayName: req.params.displayName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const chores = await Chore.find({
      $or: [
        { ownerId: user._id.toString() },
        { 'usersList.displayName': { $in: [req.params.displayName] } }
      ]
    });

    res.json(chores);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  const body = req.body;

  try {
    if (body.isRepeatable) {
      const validation = validateIntervalData(body);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.error });
      }
    }

    const choreData = {
      ownerId: body.ownerId,
      title: body.title,
      description: body.description,
      usersList: body.usersList,
      isRepeatable: body.isRepeatable || false
    };

    if (body.isRepeatable && body.intervalType) {
      choreData.intervalType = body.intervalType;

      if (body.intervalType === 'custom' && body.customDays) {
        choreData.customDays = body.customDays;
      }

      choreData.lastResetDate = new Date();
    }

    const chore = new Chore(choreData);

    const newChore = await chore.save();

    if (body.usersList && body.usersList.length > 0) {
      try {
        const creator = await User.findById(body.ownerId);
        const creatorName = creator ? creator.displayName : 'Ktoś';

        const assignedDisplayNames = body.usersList.map(user =>
          typeof user === 'string' ? user : user.displayName
        );

        if (res.authUser.displayName !== creatorName) {
          await sendPushNotifications(
            assignedDisplayNames,
            'Nowe zadanie!',
            `${creatorName} przypisał Ci nowe zadanie: ${body.title}`,
            {
              choreId: newChore._id.toString(),
              type: 'post_chore',
              title: body.title
            }
          );
        }
      } catch (notificationError) {
        console.error('Failed to send push notifications:', notificationError);
      }
    }

    logger.info("POST Chore", { method: req.method, url: req.url, data: chore });
    res.json(newChore);
  } catch (err) {
    logger.error("POST Chore", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message })
  }
});

router.patch("/:choreId", authenticateUser, async (req, res) => {
  try {
    const updatedChore = await Chore.findByIdAndUpdate(
      req.params.choreId,
      req.body,
      { new: true }
    );

    if (!updatedChore) {
      return res.status(404).json({ message: "Chore not found" });
    }

    if (updatedChore.usersList && updatedChore.usersList.length > 0) {
      const allUsersFinished = updatedChore.usersList.every(user => user.finished === true);

      if (allUsersFinished && !updatedChore.finished) {
        updatedChore.finished = true;

        if (updatedChore.isRepeatable) {
          updatedChore.lastCompletedDate = new Date();
        }

        await updatedChore.save();

        if (updatedChore.usersList.length > 1) {
          try {
            const owner = await User.findById(updatedChore.ownerId);
            const creatorName = owner ? owner.displayName : 'Ktoś';
            const allDisplayNames = updatedChore.usersList.map(user =>
              typeof user === 'string' ? user : user.displayName
            );

            if (res.authUser.displayName !== creatorName) {
              await sendPushNotifications(
                allDisplayNames,
                'Zadanie ukończone!',
                `Wszyscy ukończyli zadanie: ${updatedChore.title}`,
                {
                  choreId: updatedChore._id.toString(),
                  type: 'complete_chore',
                  title: updatedChore.title
                }
              );
            }
          } catch (notificationError) {
            console.error('Failed to send completion notification:', notificationError);
          }
        }

      } else if (!allUsersFinished && updatedChore.finished) {
        updatedChore.finished = false;
        await updatedChore.save();
      }
    }

    logger.info("PATCH Chore", { method: req.method, url: req.url, data: updatedChore });
    res.json(updatedChore);
  } catch (err) {
    logger.error("PATCH Chore", { method: req.method, url: req.url, error: err.message });
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/:choreId", authenticateUser, async (req, res) => {
  try {
    const deletedChore = await Chore.findByIdAndDelete(req.params.choreId);

    if (!deletedChore) {
      return res.status(404).json({ message: "Chore not found" });
    }

    if (deletedChore.usersList && deletedChore.usersList.length > 0) {
      try {
        const creator = await User.findById(deletedChore.ownerId);
        const creatorName = creator ? creator.displayName : 'Ktoś';

        const assignedDisplayNames = deletedChore.usersList.map(user =>
          typeof user === 'string' ? user : user.displayName
        );

        if (res.authUser.displayName !== creatorName) {
          await sendPushNotifications(
            assignedDisplayNames,
            'Usunięto zadanie!',
            `${creatorName} usunął zadanie: ${deletedChore.title}`,
            {
              choreId: deletedChore._id.toString(),
              type: 'delete_chore',
              title: deletedChore.title
            }
          );
        }
      } catch (notificationError) {
        console.error('Failed to send push notifications:', notificationError);
      }
    }

    logger.info("DELETE Chore", { method: req.method, url: req.url, data: req.params.choreId });
    res.json({ success: true });
  } catch (err) {
    logger.error("DELETE Chore", { method: req.method, url: req.url, error: err.message });
    return res.json({ message: err.message });
  }
});

// Cron Service Management (for debugging/testing)

router.get('/cron/status', authenticateUser, async (req, res) => {
  try {
    const cronService = require('../services/cronService');
    const status = cronService.getJobsStatus();
    res.json({ cronJobs: status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/cron/trigger-reset', authenticateUser, async (req, res) => {
  try {
    const cronService = require('../services/cronService');
    const resetCount = await cronService.triggerChoreReset();
    res.json({
      message: `Manually triggered chore reset. Reset ${resetCount} chores.`,
      resetCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chores Users

router.post('/users/save-expo-token', authenticateUser, async (req, res) => {
  const { userId, pushToken } = req.body;

  if (!userId || !pushToken) {
    return res.status(400).json({ error: "Missing userId or pushToken" });
  }

  try {
    let choresUser = await ChoresUser.findOne({ authUserId: userId });

    if (choresUser) {
      choresUser.pushToken = pushToken;
      await choresUser.save();
    } else {
      choresUser = new ChoresUser({
        authUserId: userId,
        pushToken: pushToken
      });
      await choresUser.save();
    }

    logger.info("POST SaveExpoToken", { method: req.method, url: req.url, data: { userId, pushToken } });
    res.json({ success: true });
  } catch (err) {
    logger.error("POST SaveExpoToken", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message })
  }
});

module.exports = router