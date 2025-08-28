const express = require("express")
const authenticateUser = require("../middleware/auth");
const Chore = require('../models/chores/chore')
const User = require('../models/user');
const ChoresUser = require('../models/chores/choresUser');
const { logger } = require("../middleware/logging");
const { Expo } = require('expo-server-sdk');

const router = express.Router()

let expo = new Expo({
  accessToken: process.env.EXPO_CHORES_ACCESS_TOKEN,
  useFcmV1: true
});

const sendPushNotifications = async (userDisplayNames, title, body, data = {}) => {
  try {
    const users = await User.find({ displayName: { $in: userDisplayNames } });
    const userIds = users.map(user => user._id.toString());

    const choresUsers = await ChoresUser.find({
      authUserId: { $in: userIds },
      pushToken: { $ne: null, $exists: true }
    });

    if (choresUsers.length === 0) {
      console.warn('No users with push tokens found');
      return;
    }

    let messages = [];
    for (let choresUser of choresUsers) {
      if (!Expo.isExpoPushToken(choresUser.pushToken)) {
        console.error(`Push token ${choresUser.pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: choresUser.pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        badge: 1,
        priority: 'high',
        ttl: 86400,
        channelId: 'myNotificationChannel',
        categoryId: 'chore_notification',
        android: {
          channelId: 'myNotificationChannel',
          sound: 'default',
          priority: 'max',
          sticky: true,
          vibrate: [0, 250, 250, 250],
          color: '#FF231F7C',
          icon: './assets/icon.png',
          largeIcon: './assets/icon.png',
          style: {
            type: 'bigText',
            text: body
          }
        },
        ios: {
          sound: 'default',
          badge: 1,
          priority: 'high',
          subtitle: 'ChoresApp',
          _displayInForeground: true,
          interruptionLevel: 'active',
          relevanceScore: 1.0
        }
      });
    }

    if (messages.length === 0) {
      console.warn('No valid push tokens to send to');
      return;
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendPushNotifications:', error);
  }
};

// Chores

router.get('/', authenticateUser, async (req, res) => {
  try {
    const filters = {};

    if (req.query.displayName) {
      filters.displayName = req.query.displayName;
    }

    if (req.query.ownerId) {
      filters.ownerId = req.query.ownerId;
    }

    if (req.query.finished !== undefined) {
      filters.finished = req.query.finished === 'true';
    }

    // Get chores where user is in usersList
    if (req.query.assignedTo) {
      filters['usersList.displayName'] = { $in: [req.query.assignedTo] };
    }

    // Get chores where user is owner OR in usersList
    if (req.query.userInvolved) {
      const user = await User.findOne({ displayName: req.query.userInvolved });
      if (user) {
        filters.$or = [
          { ownerId: user._id.toString() },
          { 'usersList.displayName': { $in: [req.query.userInvolved] } }
        ];
      }
    }

    const chores = await Chore.find(filters).sort({});
    res.json(chores);
  } catch (err) {
    res.json({ message: err.message });
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
    const chore = new Chore({
      ownerId: body.ownerId,
      title: body.title,
      description: body.description,
      usersList: body.usersList
    });

    const newChore = await chore.save();

    if (body.usersList && body.usersList.length > 0) {
      try {
        const creator = await User.findById(body.ownerId);
        const creatorName = creator ? creator.displayName : 'Ktoś';

        const assignedDisplayNames = body.usersList.map(user =>
          typeof user === 'string' ? user : user.displayName
        );

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
        await updatedChore.save();

        if (updatedChore.usersList.length > 1) {
          try {
            const owner = await User.findById(updatedChore.ownerId);
            const ownerName = owner ? owner.displayName : 'Ktoś';

            const allDisplayNames = updatedChore.usersList.map(user =>
              typeof user === 'string' ? user : user.displayName
            );

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
          } catch (notificationError) {
            console.error('Failed to send completion notification:', notificationError);
          }
        }
      }
    }

    logger.info("PATCH Chore", { method: req.method, url: req.url, data: updatedChore });
    res.json(updatedChore);
  } catch (err) {
    logger.error("PATCH Chore", { method: req.method, url: req.url, error: err.message });
    return res.json({ message: err.message });
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