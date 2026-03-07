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

module.exports = { generateUniqueDartsCode, generateTempUserId };