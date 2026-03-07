const { logger } = require("../middleware/logging");
const DartsGame = require("../models/darts/dartsGame");
const DartsUser = require("../models/darts/dartsUser");

const recalcUserStats = async (displayName) => {
  try {
    const userGames = await DartsGame.find({
      "users.displayName": displayName,
      $or: [
        { training: false },
        { training: { $exists: false } }
      ]
    });

    const gamesPlayed = userGames.length;

    let highestCheckout = 0;
    let highestEndingAvg = 0;
    let highestTurnPoints = 0;
    let overAllPoints = 0;

    const podiums = {
      firstPlace: 0,
      secondPlace: 0,
      thirdPlace: 0
    };

    const throws = {
      doors: 0,
      doubles: 0,
      triples: 0,
      normal: 0,
      overthrows: 0
    };

    for (const game of userGames) {
      const foundUser = game.users.find(
        u => u.displayName === displayName
      );

      if (!foundUser) continue;

      if (foundUser.gameCheckout > highestCheckout)
        highestCheckout = foundUser.gameCheckout;

      if (foundUser.highestGameAvg > highestEndingAvg)
        highestEndingAvg = foundUser.highestGameAvg;

      if (foundUser.highestGameTurnPoints > highestTurnPoints)
        highestTurnPoints = foundUser.highestGameTurnPoints;

      if (foundUser.allGainedPoints)
        overAllPoints += foundUser.allGainedPoints;

      if (game.podium?.[1] === displayName) podiums.firstPlace++;
      if (game.podium?.[2] === displayName) podiums.secondPlace++;
      if (game.podium?.[3] === displayName) podiums.thirdPlace++;

      if (foundUser.throws) {
        throws.doors += foundUser.throws.doors || 0;
        throws.doubles += foundUser.throws.doubles || 0;
        throws.triples += foundUser.throws.triples || 0;
        throws.normal += foundUser.throws.normal || 0;
        throws.overthrows += foundUser.throws.overthrows || 0;
      }
    }

    await DartsUser.updateOne(
      { displayName },
      {
        gamesPlayed,
        highestCheckout,
        highestEndingAvg,
        highestTurnPoints,
        overAllPoints,
        podiums,
        throws
      }
    );
    return true;
  } catch (error) {
    console.error(error);
    logger.error(error);
    return false;
  }
}

const recalcUsersStats = async (displayNames) => {
  try {
    for (const name of displayNames) {
      await recalcUserStats(name);
    }

    return true;
  } catch (error) {
    console.error(error);
    logger.error(error);
    return false;
  }
}

module.exports = { recalcUserStats, recalcUsersStats };