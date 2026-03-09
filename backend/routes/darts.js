const express = require("express")
const router = express.Router()
const DartsGame = require('../models/darts/dartsGame')
const DartsUser = require('../models/darts/dartsUser')
const User = require('../models/user');
const { Types } = require("mongoose")
const authenticateUser = require("../middleware/auth")
const { logger } = require("../middleware/logging")
const { io } = require('../server')
const dartsTournamentManager = require('../services/dartsTournamentManager');
const DartsTournament = require('../models/darts/dartsTournament');
const { generateUniqueDartsCode } = require("../lib/dartsUtils");
const DartsTournamentMatch = require("../models/darts/dartsTournamentMatch");
const { recalcUsersStats, recalcUserStats } = require("../lib/dartsStatsUtil");

const getDartsUser = async (req, res, next) => {
  let user;

  try {
    const identifier = req.params.identifier;
    if (Types.ObjectId.isValid(identifier)) {
      user = await DartsUser.findOne({ _id: identifier });
    } else {
      user = await DartsUser.findOne({ displayName: identifier });
    }
    if (user == null) return res.json({ message: "User not found." });

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
      return res.status(404).json({ message: "Game not found!" });
    }

    res.game = game;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  next();
}

async function getDartsTournament(req, res, next) {
  const { identifier } = req.params;

  try {
    const tournament = await DartsTournament.findOne({
      $or: [
        { tournamentCode: identifier },
        { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }
      ]
    }).lean();

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const matches = await DartsTournamentMatch.find({
      _id: { $in: tournament.matches }
    })
      .populate({
        path: "gameId",
        select: "users gameCode active"
      })
      .lean();

    tournament.matches = matches;

    res.tournament = tournament;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Darts Games

router.post('/dartsGames', authenticateUser, async (req, res) => {
  const body = req.body;

  try {
    const dartsGame = new DartsGame({
      created_by: body.created_by,
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
      gameCode: await generateUniqueDartsCode(),
      training: body.training || false
    });

    const newDartsGame = await dartsGame.save();

    const userDisplayNames = body.users.map(user => user.displayName);
    io.emit("gameCreated", JSON.stringify({
      game: newDartsGame,
      userDisplayNames: userDisplayNames
    }));

    logger.info("POST DartsGame", { method: req.method, url: req.url, data: newDartsGame });
    res.json(newDartsGame);
  } catch (err) {
    logger.error("POST DartsGame", { method: req.method, url: req.url, error: err.message });
    res.json({ error: err.message })
  }
});

router.get('/dartsGames', authenticateUser, async (req, res) => {
  try {
    let filter = {};
    const userDisplayName = req.query.user
    const limit = req.query.limit
    const trainingFilter = req.query.trainingFilter;
    const excludeRecord = req.query.excludeRecord === 'true';

    if (userDisplayName) filter.users = { $elemMatch: { displayName: userDisplayName } };

    if (trainingFilter === 'training') {
      filter.training = true;
    } else if (trainingFilter === 'competitive') {
      filter.$or = [{ training: false }, { training: { $exists: false } }];
    }

    const projection = excludeRecord ? { record: 0 } : null;

    const dartsGames = await DartsGame.find(filter, projection, { limit: limit, sort: { createdAt: -1, created_at: -1 } });
    res.json(dartsGames)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/dartsGames/:identifier', authenticateUser, getDartsGame, async (req, res) => {
  res.json(res.game)
});

router.patch("/dartsGames/:identifier", authenticateUser, getDartsGame, async (req, res) => {
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

    logger.info("PATCH DartsGame", { method: req.method, url: req.url, data: updatedGame });
    res.json(updatedGame);
  } catch (err) {
    logger.error("PATCH DartsGame", { method: req.method, url: req.url, error: err.message });
    return res.json({ message: err.message });
  }
});

router.delete('/dartsGames/:identifier', authenticateUser, getDartsGame, async (req, res) => {
  try {
    const game = res.game;

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const affectedUsers = game.users.map(u => u.displayName);

    await DartsGame.deleteOne({ _id: game._id });

    await recalcUsersStats(affectedUsers);

    logger.info("DELETE DartsGame", { method: req.method, url: req.url, data: res.game });
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    logger.error("DELETE DartsGame", { method: req.method, url: req.url, error: err.message });
    res.status(400).json({ message: err.message });
  }
});

// Darts Tournament

router.post('/dartsTournaments', authenticateUser, async (req, res) => {
  try {
    const { settings } = req.body;
    const tournament = new DartsTournament({
      ...req.body,
      tournamentCode: `T-${await generateUniqueDartsCode()}`,
    });
    await tournament.save();

    let tournemantWithMatches;

    if (settings.type === "bracket") tournemantWithMatches = await dartsTournamentManager.generateBracket(tournament._id);
    if (settings.type === "ffa") tournemantWithMatches = await dartsTournamentManager.generateFFAMatches(tournament._id);
    else {
      res.status({ message: "Settings Type wrong" });
    }

    if (!tournemantWithMatches) throw new Error("Failed generating dartsTournament");

    io.emit("tournamentCreated", JSON.stringify({
      tournamentCode: tournemantWithMatches.tournamentCode,
      userDisplayNames: tournemantWithMatches.participants,
      tournamentAdmin: tournemantWithMatches.admin
    }));

    res.status(201).json(tournemantWithMatches);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/dartsTournaments', authenticateUser, async (req, res) => {
  try {
    let filter = {};
    const userDisplayName = req.query.user
    const limit = req.query.limit

    if (userDisplayName) filter.participants = { $elemMatch: { displayName: userDisplayName } };

    const dartsTournaments = await DartsTournament.find(filter, null, { limit: limit, sort: { createdAt: -1, created_at: -1 } });
    res.json(dartsTournaments)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/dartsTournaments/:identifier', authenticateUser, getDartsTournament, async (req, res) => {
  res.json(res.tournament)
});

router.get('/dartsTournaments/:id/games', authenticateUser, async (req, res) => {
  try {
    const games = await DartsGame.find({ tournamentId: req.params.id });
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/dartsTournaments/:identifier', authenticateUser, getDartsTournament, async (req, res) => {
  try {
    const tournament = res.tournament;

    const matches = await DartsTournamentMatch.find({
      _id: { $in: tournament.matches }
    });

    const gameIds = matches
      .map(m => m.gameId)
      .filter(id => id !== null);

    const affectedUsers = new Set();

    for (const match of matches) {
      if (match.gameId) {
        const game = await DartsGame.findById(match.gameId);

        if (game) {
          game.users.forEach(u => affectedUsers.add(u.displayName));
        }
      }
    }

    if (gameIds.length > 0) {
      await DartsGame.deleteMany({ _id: { $in: gameIds } });
    }

    await recalcUsersStats([...affectedUsers]);

    await DartsTournamentMatch.deleteMany({
      _id: { $in: tournament.matches }
    });

    await DartsTournament.deleteOne({ _id: tournament._id });

    logger.info("DELETE DartsTournament", {
      method: req.method,
      url: req.url,
      tournamentId: tournament._id
    });

    res.json({ message: "Tournament deleted successfully" });

  } catch (err) {
    logger.error("DELETE DartsTournament", { method: req.method, url: req.url, error: err.message });
    res.status(400).json({ message: err.message });
  }
});

// Darts Users

router.get('/dartsUsers', authenticateUser, async (req, res) => {
  try {
    const dartsUsers = await DartsUser.find()
    res.json(dartsUsers)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/dartsUsers/:identifier', authenticateUser, getDartsUser, async (req, res) => {
  res.send(res.user);
});

router.patch("/dartsUsers/:identifier", authenticateUser, getDartsUser, async (req, res) => {
  try {
    const updatedUser = await DartsUser.findByIdAndUpdate(
      res.user._id,
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("PATCH DartsUser", { method: req.method, url: req.url, data: res.user });
    res.json(updatedUser);
  } catch (err) {
    logger.error("PATCH DartsUser", { method: req.method, url: req.url, error: err.message });
    return res.json({ message: err.message });
  }
});

router.delete('/dartsUsers/:displayName', authenticateUser, async (req, res) => {
  try {
    await DartsUser.deleteOne({ displayName: req.params.displayName });

    logger.info("DELETE DartsUser", { method: req.method, url: req.url, data: req.params.displayName });
    res.json({ ok: true });
  } catch (err) {
    logger.error("DELETE DartsUser", { method: req.method, url: req.url, error: err.message });
    res.status(400).json({ message: err.message });
  }
});

router.post('/dartsUsers', authenticateUser, async (req, res) => {
  const body = req.body;

  try {
    const dartsUser = new DartsUser({
      displayName: body.displayName,
      gamesPlayed: body.gamesPlayed,
      podiums: body.podiums,
      overAllPoints: body.overAllPoints,
      highestEndingAvg: body.highestEndingAvg,
      highestCheckout: body.highestCheckout,
      highestTurnPoints: body.highestTurnPoints,
      throws: body.throws,
    });

    const newDartsUser = await dartsUser.save();

    logger.info("POST DartsUser", { method: req.method, url: req.url, data: newDartsUser });
    res.json(newDartsUser);
  } catch (err) {
    logger.error("POST DartsUser", { method: req.method, url: req.url, error: err.message });
    res.status(400).json({ message: err.message })
  }
});

// Utils

router.post('/game/join/:gameCode', async (req, res) => {
  try {
    const gameCode = req.params.gameCode;

    const game = await DartsGame.findOne({ gameCode: gameCode });

    return res.json(game);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.post('/utils/recalcUsersStats', authenticateUser, async (req, res) => {
  try {
    const body = req.body;

    const response = await recalcUsersStats(body.displayNames);

    return res.json({ successful: response });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.post('/utils/recalcUserStats', authenticateUser, async (req, res) => {
  try {
    const body = req.body;

    const response = await recalcUserStats(body.displayName);

    return res.json({ successful: response });
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.get('/utils/dartsPage/:userDisplayName', authenticateUser, async (req, res) => {
  try {
    const userDisplayName = req.params.userDisplayName;

    const currentUser = await User.findOne({ displayName: userDisplayName }, { friends: 1 });
    const friendsDisplayNames = currentUser?.friends || [];

    const [
      recentGames,
      allActiveGames,
      currentDartsUser,
      friendsDartsUsers,
      gamesCount,
      allDartsUsers
    ] = await Promise.all([
      DartsGame.find(
        {
          users: { $elemMatch: { displayName: userDisplayName } },
          $or: [{ training: false }, { training: { $exists: false } }]
        },
        { record: 0 },
        { limit: 10, sort: { createdAt: -1, created_at: -1 } }
      ),
      DartsGame.find(
        {
          users: { $elemMatch: { displayName: userDisplayName } },
          active: true
        },
        { record: 0 }
      ),
      DartsUser.findOne({ displayName: userDisplayName }),
      friendsDisplayNames.length > 0
        ? DartsUser.find({ displayName: { $in: friendsDisplayNames }, visible: true })
        : [],
      DartsGame.countDocuments(),
      DartsUser.find({}, { overAllPoints: 1, throws: 1 })
    ]);

    const overAllPoints = allDartsUsers.reduce((sum, user) => sum + (user.overAllPoints || 0), 0);
    const doorHits = allDartsUsers.reduce((sum, user) => sum + (user.throws?.doors || 0), 0);

    res.json({
      recentGames,
      activeGame: allActiveGames.find(game =>
        game.active === true &&
        game.users.some(user => user.displayName === userDisplayName)
      ) || null,
      currentDartsUser,
      friendsDartsUsers,
      statistics: {
        gamesPlayed: gamesCount,
        overAllPoints,
        doorHits
      }
    });
  } catch (err) {
    logger.error("GET DartsPage", { method: req.method, url: req.url, error: err.message });
    res.status(500).json({ message: err.message });
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