const express = require("express")
const router = express.Router()
const DartsGame = require('../models/dartsGame')
const DartsUser = require('../models/dartsUser')
const { Types } = require("mongoose")

const getDartsUser = async (req, res, next) => {
  let user;
  try {
    const identifier = req.params.identifier;
    if (Types.ObjectId.isValid(identifier)) {
      user = await DartsUser.findOne({ _id: identifier });
    } else {
      user = await DartsUser.findOne({ displayName: identifier });
    }
    if (user == null) return res.status(404).json({ message: "User not found." });

    res.user = user;
  } catch (err) {
    return res.json({ message: err.message })
  }
  next();
}

const getDartsGame = async (req, res, next) => {
  try {
    let game;
    if (Types.ObjectId.isValid(req.params.identifier)) {
      game = await DartsGame.findById(req.params.identifier);
    } else {
      game = await DartsGame.findOne({ gameCode: req.params.identifier });
    }

    if (!game) {
      return res.status(404).json({ message: "Game code is wrong." });
    }

    res.game = game;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  next();
}

const generateUniqueGameCode = async () => {
  let gameCode;
  do {
    gameCode = Math.floor(1000 + Math.random() * 9000);
  } while (await DartsGame.findOne({ gameCode: gameCode.toString() }));
  return gameCode.toString();
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

router.get('/dartsGames/:identifier', getDartsGame, async (req, res) => {
  res.json(res.game)
});


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
    gameCode: await generateUniqueGameCode()
  });
  try {
    const newDartsGame = await dartsGame.save()
    res.json(newDartsGame)
  } catch (err) {
    res.json({ error: err.message })
  }
});

router.put("/dartsGames/:identifier", getDartsGame, async (req, res) => {
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

router.delete('/dartsGames/:identifier', getDartsGame, async (req, res) => {
  try {
    await DartsGame.deleteOne({ _id: res.game._id });
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
})

router.post("/dartsGames/join-live-game-preview/:gameCode", async (req, res) => {
  const { gameCode } = req.params;
  try {
    const game = await DartsGame.findOne({ gameCode: gameCode });

    if (game) return res.json({ ok: true, game: game })
    else return res.json({ ok: false })
  } catch (err) {
    return res.json({ message: err.message });
  }
});

// Darts Users
router.get('/dartsUsers', async (req, res) => {
  try {
    const dartsUsers = await DartsUser.find()
    res.json(dartsUsers)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/dartsUsers/:identifier', getDartsUser, async (req, res) => {
  res.send(res.user);
});

router.delete('/dartsUsers/:displayName', async (req, res) => {
  try {
    await DartsUser.deleteOne({ displayName: req.params.displayName });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/dartsUsers/:identifier", getDartsUser, async (req, res) => {
  try {
    const updatedUser = await DartsUser.findByIdAndUpdate(
      res.user._id,
      req.body,
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
    highestCheckout: body.highestCheckout,
    highestTurnPoints: body.highestTurnPoints,
    throws: body.throws,
  })
  try {
    const newDartsUser = await dartsUser.save()
    res.json(newDartsUser)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
});

// Statistics

// Darts
router.get('/statistics/dartsGames', async (req, res) => {
  try {
    const dartsGamesCount = await DartsGame.countDocuments();
    res.json(dartsGamesCount);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/overAllPoints', async (req, res) => {
  try {
    const dartsUsers = await DartsUser.find();

    const usersOverAllPoints = dartsUsers.map((user) => user.overAllPoints);
    const overAllPoints = usersOverAllPoints.reduce((partialSum, a) => partialSum + a, 0);

    res.json(overAllPoints);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/doorHits', async (req, res) => {
  try {
    const dartsUsers = await DartsUser.find();

    const usersDoorHits = dartsUsers.map((user) => user.throws.doors);
    const doorHits = usersDoorHits.reduce((partialSum, a) => partialSum + a, 0);

    res.json(doorHits);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/top3players', async (req, res) => {
  try {
    const top3Players = await DartsUser.find().sort({ "podiums.firstPlace": -1 }).limit(3);

    res.json(top3Players);
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/statistics/top3doorhitters', async (req, res) => {
  try {
    const top3DoorHitters = await DartsUser.find().sort({ "throws.doors": -1 }).limit(3);

    res.json(top3DoorHitters);
  } catch (err) {
    res.json({ message: err.message })
  }
});

// Get gamesPlayed for portfolio
router.get('/dartsUsers/portfolio/:identifier', getDartsUser, async (req, res) => {
  res.send({ gamesPlayed: res.user.gamesPlayed })
});

module.exports = router