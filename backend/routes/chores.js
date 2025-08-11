const express = require("express")
const authenticateUser = require("../middleware/auth");
const Chore = require('../models/chore')
const User = require('../models/user');
const { logger } = require("../middleware/logging");

const router = express.Router()

router.get('/', authenticateUser, async (req, res) => {
  try {
    const filters = {};

    if (req.query.displayName) {
      filters.displayName = req.query.displayName;
    }

    if (req.query.userId) {
      filters.ownerId = req.query.userId;
    }

    if (req.query.finished !== undefined) {
      filters.finished = req.query.finished === 'true';
    }

    const chores = await Chore.find(filters).sort({});
    res.json(chores)
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get('/:displayName', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ displayName: req.params.displayName });
    const chores = await Chore.find({ ownerId: user._id });
    res.json(chores)
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

    logger.info("PATCH Chore", { method: req.method, url: req.url, data: updatedChore });
    res.json(updatedChore);
  } catch (err) {
    logger.error("PATCH Chore", { method: req.method, url: req.url, error: err.message });
    return res.json({ message: err.message });
  }
});

module.exports = router