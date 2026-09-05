const express = require("express")
const authenticateUser = require("../middleware/auth");
const User = require('../models/user');
const Quote = require("../models/quote");
const { logger } = require("../middleware/logging");

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.find();

    res.status(200).json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:displayName', async (req, res) => {
  try {
    const user = await User.findOne({ displayName: req.params.displayName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const quotes = await Quote.find({ userId: user._id });

    res.json(quotes);
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  const body = req.body;

  try {
    const quote = new Quote({
      userId: res.authUser._id,
      title: body.title,
      description: body.description,
    });

    const newQuote = await quote.save();

    logger.info("POST Quote", { method: req.method, url: req.url, data: newQuote });
    res.json(newQuote);
  } catch (err) {
    logger.error("POST Quote", { method: req.method, url: req.url, error: err.message });
    res.json({ message: err.message });
  }
});

module.exports = router