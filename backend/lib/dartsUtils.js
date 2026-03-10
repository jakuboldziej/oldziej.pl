const DartsGame = require('../models/darts/dartsGame');
const crypto = require('crypto');

const generateUniqueDartsCode = async () => {
  let dartsCode;
  do {
    dartsCode = Math.floor(1000 + Math.random() * 9000);
  } while (await DartsGame.findOne({ gameCode: dartsCode.toString() }));
  return dartsCode.toString();
}

const generateTempUserId = () => {
  const randomValue = crypto.randomBytes(8).toString('hex');
  return `temp_user_${randomValue}`;
};

const getInitialUsersGameState = (users, startPoints, randomize = false) => {
  const throwsData = {
    doors: 0,
    doubles: 0,
    triples: 0,
    normal: 0,
    overthrows: 0
  };

  let initializedUsers = users.map((user) => ({
    _id: user._id,
    displayName: user.displayName,
    visibleName: user.visibleName || user.displayName,

    points: parseInt(startPoints),

    turn: false,
    currentTurn: 1,
    turns: { 1: null, 2: null, 3: null },
    turnsSum: 0,

    allGainedPoints: 0,
    place: 0,

    legs: 0,
    sets: 0,
    totalLegsWon: 0,

    avgPointsPerTurn: "0.00",
    highestGameAvg: "0.00",
    highestGameTurnPoints: 0,
    gameCheckout: 0,

    throws: { ...throwsData },
    currentThrows: { ...throwsData },

    temporary: user.temporary || user._id?.toString().includes("temp") || false
  }));

  if (randomize) {
    initializedUsers = initializedUsers.sort(() => Math.random() - 0.5);
  }

  if (initializedUsers.length > 0) {
    initializedUsers[0].turn = true;
  }

  return initializedUsers;
};

module.exports = { generateUniqueDartsCode, generateTempUserId, getInitialUsersGameState };