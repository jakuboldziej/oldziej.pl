const express = require("express")
const router = express.Router()
const DartsGame = require('../models/dartsGame')
const DartsUser = require('../models/dartsUser')

const getDartsUser = async (req, res, next) => {
  let user;
  try {
    const { displayName } = req.params;
    user = await DartsUser.findOne({ displayName });
    if (user == null) return res.status(404);
  } catch (err) {
    return res.json({ message: err.message })
  }
  res.user = user;
  next();
}

const getDartsGame = async (req, res, next) => {
  let game;
  try {
    game = await DartsGame.findById({ _id: req.params.id });
    if (game == null) return res.status(404);
  } catch (err) {
    return res.status(500)
  }
  res.game = game;
  next();
}

// Darts Games
router.get('/dartsGames', async (req, res) => {
  try {
    let filter = {};
    const userDisplayName = req.query.user
    const limit = req.query.limit
    if (userDisplayName) filter.users = { $elemMatch: { displayName: userDisplayName } };

    const dartsGames = await DartsGame.find(filter, null, { limit: limit, sort: { created_at: -1 } });
    res.json(dartsGames)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/dartsGames/:id', getDartsGame, async (req, res) => {
  res.send(res.game);
})

router.post('/dartsGames', async (req, res) => {
  const body = req.body;
  const dartsGame = new DartsGame({
    created_by: body.created_by,
    created_at: body.created_at,
    users: body.users,
    podiums: body.podiums,
    podium: {
      1: null,
      2: null,
      3: null
    },
    turn: body.turn,
    active: true,
    gameMode: body.gameMode,
    startPoints: body.startPoints,
    checkOut: body.checkOut,
    sets: body.sets,
    legs: body.legs,
    round: 1,
  })
  try {
    const newDartsGame = await dartsGame.save()
    res.json(newDartsGame)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.put("/dartsGames/:id", getDartsGame, async (req, res) => {
  const { ...updateData } = req.body;
  try {
    const updatedGame = await DartsGame.findByIdAndUpdate(
      res.game._id,
      updateData,
      { new: true }
    );
    if (!updatedGame) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(updatedGame);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.delete('/dartsGames/:id', getDartsGame, async (req, res) => {
  try {
    await DartsGame.deleteOne({ _id: res.game._id });
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

// Darts Users
router.get('/dartsUsers', async (req, res) => {
  try {
    const dartsUsers = await DartsUser.find()
    res.json(dartsUsers)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/dartsUsers/:displayName', getDartsUser, async (req, res) => {
  res.send(res.user)
});

router.delete('/dartsUsers/:displayName', async (req, res) => {
  try {
    await DartsUser.deleteOne({ displayName: req.params.displayName });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/dartsUsers/:displayName", getDartsUser, async (req, res) => {
  const { displayName, ...updateData } = req.body;
  try {
    const updatedUser = await DartsUser.findByIdAndUpdate(
      res.user._id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.post('/dartsUsers', async (req, res) => {
  const body = req.body;
  const dartsUser = new DartsUser({
    displayName: body.displayName,
    gamesPlayed: body.gamesPlayed,
    podiums: body.podiums,
    overAllPoints: body.overAllPoints,
    highestEndingAvg: body.highestEndingAvg,
    highestOuts: body.highestOuts,
    highestRoundPoints: body.highestRoundPoints,
    throws: body.throws,
  })
  try {
    const newDartsUser = await dartsUser.save()
    res.json(newDartsUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

// Get gamesPlayed for portfolio
router.get('/dartsUsers/portfolio/:displayName', getDartsUser, async (req, res) => {
  res.send({ gamesPlayed: res.user.gamesPlayed })
})

module.exports = router