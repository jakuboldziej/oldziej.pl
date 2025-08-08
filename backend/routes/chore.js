const express = require("express")
const authenticateUser = require("../middleware/auth");
const Chore = require('../models/chore')

const router = express.Router()

router.get('/chores', authenticateUser, async (req, res) => {
  try {
    const chores = await Chore.find();
    res.json(chores)
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get('/chores/:displayName', authenticateUser, async (req, res) => {
  try {
    const chores = await Chore.find({ displayName: req.params.displayName });
    res.json(chores)
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router