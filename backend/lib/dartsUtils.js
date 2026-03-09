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

const getInitialUserGameState = (user, startPoints, isFirst = false) => {
  return {
    _id: user._id,
    displayName: user.displayName,
    points: parseInt(startPoints),
    turn: isFirst,
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
    throws: { doors: 0, doubles: 0, triples: 0, normal: 0, overthrows: 0 },
    currentThrows: { doors: 0, doubles: 0, triples: 0, normal: 0, overthrows: 0 },
    temporary: user.temporary || user._id.toString().includes("temp") || false
  };
};

module.exports = { generateUniqueDartsCode, generateTempUserId, getInitialUserGameState };