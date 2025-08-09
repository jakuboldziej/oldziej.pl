const express = require("express")
const authenticateUser = require("../middleware/auth");
const Chore = require('../models/chore')
const User = require('../models/user')

const router = express.Router()

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
    res.json(newChore);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    const chores = await Chore.find();
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

module.exports = router