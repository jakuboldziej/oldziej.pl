const express = require("express")
const authenticateUser = require("../middleware/auth");
const { isSelfOrAdminById } = require("../middleware/authorize");
const ChoresUser = require('../models/chores/choresUser');

const router = express.Router()

router.get('/:authUserId', authenticateUser, async (req, res) => {
  try {
    if (!isSelfOrAdminById(res.authUser, req.params.authUserId)) {
      return res.status(403).json({ message: "You can only read your own profile." });
    }

    const choresUser = await ChoresUser.findOne({ authUserId: req.params.authUserId });
    if (!choresUser) {
      return res.status(404).json({ message: "ChoresUser not found" });
    }

    res.json(choresUser);
  } catch (err) {
    res.json({ message: err.message });
  }
});

module.exports = router