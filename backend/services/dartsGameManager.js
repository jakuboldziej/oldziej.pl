const DartsGame = require('../models/dartsGame');
const DartsUser = require('../models/dartsUser');
const { logger } = require('../middleware/logging');
const {
  handleWLEDEffectSolid,
  handleWLEDGameEnd,
  handleWLEDThrowDoors,
  handleWLEDThrowT20,
  handleWLEDThrowD25,
  handleWLEDThrow180,
  handleWLEDOverthrow
} = require('./wledService');

// Game state manager - stores active games in memory
const activeGames = new Map();

// Utility functions
const calculatePoints = (turnValue) => {
  const isNumericRegex = /^\d+$/;
  if (!isNumericRegex.test(turnValue) && turnValue) {
    if (turnValue[0] === "D") {
      return parseInt(turnValue.slice(1)) * 2;
    }
    if (turnValue[0] === "T") {
      return parseInt(turnValue.slice(1)) * 3;
    }
  }
  return turnValue ? parseInt(turnValue) : turnValue;
};

const handleTurnsSum = (currentUser) => {
  const currentTurn = currentUser.turns[currentUser.currentTurn];
  const turnValue = calculatePoints(currentTurn) || 0;
  currentUser.turnsSum += turnValue;
};

const updateHighestTurnPoints = (currentUser) => {
  if (currentUser.turnsSum > currentUser.highestGameTurnPoints) {
    currentUser.highestGameTurnPoints = currentUser.turnsSum;
  }
};

const totalThrows = (user, cr = true) => {
  if (cr) {
    return Object.values(user.currentThrows).reduce((acc, val) => acc + val, 0) - user.currentThrows["overthrows"];
  } else {
    return Object.values(user.throws).reduce((acc, val) => acc + val, 0) - user.throws["overthrows"];
  }
};

const handleAvgPointsPerTurn = (user, game) => {
  const pointsThrown = parseInt(game.startPoints) - user.points;
  const dartsThrown = totalThrows(user);
  const avg = (pointsThrown / dartsThrown) * 3;

  user.avgPointsPerTurn = (avg).toFixed(2);
  if (isNaN(avg)) user.avgPointsPerTurn = 0;

  return (avg).toFixed(2);
};

// Game mode handlers
const doorsValueReverseX01 = 40;
const zeroValueReverseX01 = 20;

const handlePodiumX01 = (game, currentUser) => {
  currentUser.place = 1;
  game.podium[1] = currentUser.displayName;
  game.userWon = currentUser.displayName;
  game.active = false;
  game.finished_at = Date.now();

  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (usersWithoutPodium.length > 0) {
    let sortedUsers = [];

    if (parseInt(game.sets) > 1) {
      sortedUsers = usersWithoutPodium.sort((a, b) => {
        if (b.sets !== a.sets) return b.sets - a.sets;
        if ((b.totalLegsWon || 0) !== (a.totalLegsWon || 0)) return (b.totalLegsWon || 0) - (a.totalLegsWon || 0);
        if (a.points !== b.points) return a.points - b.points;
        return b.allGainedPoints - a.allGainedPoints;
      });
    } else if (parseInt(game.legs) > 1) {
      sortedUsers = usersWithoutPodium.sort((a, b) => {
        if (b.legs !== a.legs) return b.legs - a.legs;
        if (a.points !== b.points) return a.points - b.points;
        return b.allGainedPoints - a.allGainedPoints;
      });
    } else {
      sortedUsers = usersWithoutPodium.sort((a, b) => {
        if (a.points !== b.points) return a.points - b.points;
        return b.allGainedPoints - a.allGainedPoints;
      });
    }

    if (sortedUsers[0]) { game.podium[2] = sortedUsers[0].displayName; sortedUsers[0].place = 2; }
    if (sortedUsers[1]) { game.podium[3] = sortedUsers[1].displayName; sortedUsers[1].place = 3; }
  }
};

const handlePodiumReverseX01 = (game, currentUser) => {
  const reverseUser = game.users.find((user) => user.displayName !== currentUser.displayName);
  reverseUser.place = 1;
  game.podium[1] = reverseUser.displayName;
  game.userWon = reverseUser.displayName;
  game.active = false;
  game.finished_at = Date.now();

  const usersWithoutPodium = game.users.filter(({ place }) => !place);
  if (usersWithoutPodium.length > 0) {
    const sortedUsers = usersWithoutPodium.sort((a, b) => a.allGainedPoints - b.allGainedPoints);
    if (sortedUsers[0]) { game.podium[2] = sortedUsers[0].displayName; sortedUsers[0].place = 2; }
    if (sortedUsers[1]) { game.podium[3] = sortedUsers[1].displayName; sortedUsers[1].place = 3; }
  }
};

// Checkouts

const handleCheckoutStraightOut = (userCurrentTurn) => {
  if (userCurrentTurn[0] === "D" || userCurrentTurn[0] === "T") {
    return { overthrow: true, gameEnd: false };
  }

  return { overthrow: false, gameEnd: true };
};

const handleCheckoutDoubleOut = (userCurrentTurn) => {
  if (userCurrentTurn[0] !== "D") {
    return { overthrow: true, gameEnd: false };
  }

  return { overthrow: false, gameEnd: true };
};

const handleCheckoutTripleOut = (userCurrentTurn) => {
  if (userCurrentTurn[0] !== "T") {
    return { overthrow: true, gameEnd: false };
  }

  return { overthrow: false, gameEnd: true };
};

// Handle points

const handleOverthrow = (gameCode, currentUser, io, shouldEmit = true) => {
  const initialPoints = parseInt(currentUser.points) + calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3]);

  currentUser.allGainedPoints -= currentUser.turnsSum;
  currentUser.points = initialPoints;
  currentUser.turnsSum = 0;
  currentUser.currentTurn = 3;
  currentUser.turns = { 1: null, 2: null, 3: null };
  currentUser.throws["overthrows"] += 1;
  currentUser.currentThrows["overthrows"] += 1;

  if (shouldEmit) {
    io.to(`game-${gameCode}`).emit("userOverthrowClient", currentUser.displayName);
    handleWLEDOverthrow(gameCode);
  }
}

const handlePointsX01 = (game, currentUser, io) => {
  const currentTurnValue = currentUser.turns[currentUser.currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  currentUser.allGainedPoints = parseInt(game.startPoints) - currentUser.points;

  if (currentUser.currentTurn === 3 && currentUser.points >= 0) {
    updateHighestTurnPoints(currentUser);
  }

  if (currentUser.points < 0) {
    handleOverthrow(game.gameCode, currentUser, io, false);

    return { overthrow: true, gameEnd: false, shouldEmitOverthrow: true };
  } else if (currentUser.points === 0) {
    let result = { overthrow: false, gameEnd: true };

    if (game.checkOut === "Straight Out") result = handleCheckoutStraightOut(currentUser.turns[currentUser.currentTurn]);
    if (game.checkOut === "Double Out") result = handleCheckoutDoubleOut(currentUser.turns[currentUser.currentTurn]);
    if (game.checkOut === "Triple Out") result = handleCheckoutTripleOut(currentUser.turns[currentUser.currentTurn]);
    if (game.checkOut === "Any Out") result = { overthrow: false, gameEnd: true };

    if (result.overthrow === true) {
      handleOverthrow(game.gameCode, currentUser, io, false);
      result.shouldEmitOverthrow = true;
    }

    return result;
  }

  if (game.checkOut === "Double Out" && currentUser.points < 2) {
    handleOverthrow(game.gameCode, currentUser, io, false);
    return { overthrow: true, gameEnd: false, shouldEmitOverthrow: true };
  } else if (game.checkOut === "Triple Out" && currentUser.points < 3) {
    handleOverthrow(game.gameCode, currentUser, io, false);
    return { overthrow: true, gameEnd: false, shouldEmitOverthrow: true };
  }

  return { overthrow: false, gameEnd: false };
};

const handlePointsReverseX01 = (game, currentUser) => {
  const { turns } = currentUser;
  const currentTurnValue = turns[currentUser.currentTurn];

  currentUser.points -= calculatePoints(currentTurnValue);
  currentUser.allGainedPoints = parseInt(game.startPoints) - currentUser.points;

  if (currentUser.points <= 0) {
    return { gameEnd: true };
  } else {
    return { gameEnd: false };
  }
};

const handleNextLeg = (game, currentUser) => {
  const legCheckout = calculatePoints(currentUser.turns[1]) + calculatePoints(currentUser.turns[2]) + calculatePoints(currentUser.turns[3]);
  if (legCheckout > currentUser.gameCheckout) currentUser.gameCheckout = legCheckout;

  currentUser.legs += 1;

  if (!currentUser.totalLegsWon) currentUser.totalLegsWon = 0;
  currentUser.totalLegsWon += 1;

  let endSet = false;
  let endGame = false;

  const legs = parseInt(game.legs);
  const sets = parseInt(game.sets);

  if (sets === 0 && legs > 0 && currentUser.legs === legs) {
    endGame = true;
    endSet = false;
  }
  else if (legs > 0 && currentUser.legs === legs) {
    endSet = true;
    currentUser.sets += 1;

    if (sets > 0 && currentUser.sets === sets) {
      endGame = true;
    }
  }
  else if (legs === 0 && sets > 0) {
    currentUser.sets += 1;
    endSet = false;

    if (currentUser.sets === sets) {
      endGame = true;
    }
  }

  game.users.forEach((user) => {
    if (user.avgPointsPerTurn > user.highestGameAvg) user.highestGameAvg = user.avgPointsPerTurn;
  });

  if (endGame) {
    return { endGame: true, endSet: endSet };
  }

  game.users.forEach((user) => {
    user.points = parseInt(game.startPoints);
    user.avgPointsPerTurn = "0.00";
    user.turnsSum = 0;
    user.turn = false;
    user.currentTurn = 1;
    user.turns = {
      1: null,
      2: null,
      3: null
    };
    user.currentThrows = {
      doors: 0,
      doubles: 0,
      triples: 0,
      normal: 0,
      overthrows: 0,
    };

    if (endSet) {
      user.legs = 0;
    }
  });

  game.legStarterIndex = (game.legStarterIndex + 1) % game.users.length;

  const newStarter = game.users[game.legStarterIndex];
  newStarter.turn = true;
  newStarter.currentTurn = 1;
  newStarter.turns = { 1: null, 2: null, 3: null };
  newStarter.turnsSum = 0;
  game.turn = newStarter.displayName;

  game.round = 1;

  return { endGame: false, endSet: endSet };
};

class DartsGameManager {
  constructor(gameCode, io) {
    this.gameCode = gameCode;
    this.io = io;
    this.game = null;
    this.dartsUsersBeforeBack = [];
    this.requestQueue = [];
    this.isProcessing = false;
    this.updateRetryCount = 0;
    this.maxRetries = 3;
  }

  async loadGame() {
    const game = await DartsGame.findOne({ gameCode: this.gameCode });
    if (!game) throw new Error('Game not found');
    this.game = game.toObject();

    if (this.game.legStarterIndex === undefined) {
      const currentStarter = this.game.users.findIndex(u => u.turn);
      this.game.legStarterIndex = currentStarter >= 0 ? currentStarter : 0;

      await DartsGame.findOneAndUpdate(
        { gameCode: this.gameCode },
        { legStarterIndex: this.game.legStarterIndex },
        { new: true }
      );
    }

    this.game.users.forEach(user => {
      if (user.totalLegsWon === undefined) {
        user.totalLegsWon = 0;
      }
    });

    if (!this.game.record || this.game.record.length === 0) {
      this.game.record = [];
    }

    if (this.game.record.length === 0) {
      const usersCopy = JSON.parse(JSON.stringify(this.game.users));
      this.game.record.push({
        game: {
          round: this.game.round,
          turn: this.game.turn,
        },
        users: usersCopy,
      });
    }

    return this.game;
  }

  getCurrentUser() {
    if (!this.game || !this.game.users) return null;
    return this.game.users.find(user => user.turn);
  }

  async updateGameState(skipEmit = false) {
    try {
      const { userWon, ...restGameData } = this.game;
      await DartsGame.findOneAndUpdate(
        { gameCode: this.gameCode },
        {
          ...restGameData,
          legStarterIndex: this.game.legStarterIndex,
          record: this.game.record
        },
        { new: true }
      );

      if (!skipEmit) {
        await this.emitGameUpdate();
      }

      return this.game;
    } catch (err) {
      logger.error("Error updating game state", { error: err.message });
      throw err;
    }
  }

  async emitGameUpdate(retryCount = 0) {
    try {
      const sockets = await this.io.in(`game-${this.gameCode}`).fetchSockets();

      if (sockets.length === 0 && retryCount < this.maxRetries) {
        logger.warn(`No sockets in room game-${this.gameCode}, retrying... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.emitGameUpdate(retryCount + 1);
      }

      const gameString = JSON.stringify(this.game);

      this.io.to(`game-${this.gameCode}`).emit("updateLiveGamePreviewClient", gameString);

    } catch (error) {
      logger.error(`Error emitting game update for ${this.gameCode}:`, { error: error.message });
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.emitGameUpdate(retryCount + 1);
      }
    }
  }

  handleRecord(action) {
    if (action === "save") {
      if (!this.game.active) return;

      const usersCopy = JSON.parse(JSON.stringify(this.game.users));

      this.game.record.push({
        game: {
          round: this.game.round,
          turn: this.game.turn,
          legStarterIndex: this.game.legStarterIndex,
        },
        users: usersCopy,
      });
    } else if (action === "back") {
      if (this.game.record.length <= 1) {
        logger.warn('Cannot go back further - at initial state');
        return;
      }

      this.game.record.splice(-1);

      const restoredState = this.game.record[this.game.record.length - 1];

      if (restoredState) {
        this.game.users = JSON.parse(JSON.stringify(restoredState.users));
        this.game.round = restoredState.game.round;
        this.game.turn = restoredState.game.turn;
        if (restoredState.game.legStarterIndex !== undefined) {
          this.game.legStarterIndex = restoredState.game.legStarterIndex;
        }
      }
    }
  }

  handleNextUser(finishingUser = null) {
    const userToFind = finishingUser || this.getCurrentUser();

    if (!userToFind) {
      const firstUser = this.game.users[0];
      if (firstUser) {
        firstUser.turn = true;
        firstUser.turns = { 1: null, 2: null, 3: null };
        firstUser.turnsSum = 0;
        this.game.turn = firstUser.displayName;
        return firstUser;
      }
      return null;
    }

    const remainingUsers = this.game.users.filter(user => user.place === 0);

    if (remainingUsers.length === 0) return null;

    let nextUserIndex = (this.game.users.findIndex(user => user._id.toString() === userToFind._id.toString()) + 1) % this.game.users.length;
    let nextUser = this.game.users[nextUserIndex];

    while (nextUser.place !== 0) {
      nextUserIndex = (nextUserIndex + 1) % this.game.users.length;
      nextUser = this.game.users[nextUserIndex];
    }

    nextUser.turn = true;
    nextUser.turns = { 1: null, 2: null, 3: null };
    nextUser.turnsSum = 0;

    this.game.turn = nextUser.displayName;

    const isLastUser = remainingUsers[remainingUsers.length - 1]._id.toString() === userToFind._id.toString();

    if (isLastUser) this.game.round += 1;

    return nextUser;
  }

  async handleUsersBeforeBack() {
    const tempUsers = await Promise.all(
      this.game.users.map(async (user) => {
        const dartUser = await DartsUser.findOne({ displayName: user.displayName });
        return dartUser ? dartUser.toObject() : null;
      })
    );

    this.dartsUsersBeforeBack = tempUsers.filter(u => u !== null);
    return this.dartsUsersBeforeBack;
  }

  async updateUsersData() {
    try {
      await Promise.all(this.game.users.map(async (user) => {
        if (parseInt(this.game.legs) === 1 && parseInt(this.game.sets) === 1) user.highestGameAvg = user.avgPointsPerTurn;

        if (user.temporary || user.verified === false) {
          return;
        }
        if (this.game.training) {
          return;
        }

        const dartUser = await DartsUser.findOne({ displayName: user.displayName });
        if (!dartUser) {
          logger.warn(`[updateUsersData] DartsUser not found for: ${user.displayName}`);
          return;
        }

        // Update podium counts if user placed
        if (user.place === 1) {
          dartUser.podiums.firstPlace += 1;
          dartUser.markModified('podiums');
        }
        if (user.place === 2) {
          dartUser.podiums.secondPlace += 1;
          dartUser.markModified('podiums');
        }
        if (user.place === 3) {
          dartUser.podiums.thirdPlace += 1;
          dartUser.markModified('podiums');
        }

        dartUser.throws["doors"] += user.throws["doors"];
        dartUser.throws["doubles"] += user.throws["doubles"];
        dartUser.throws["triples"] += user.throws["triples"];
        dartUser.throws["normal"] += user.throws["normal"];

        dartUser.markModified('throws');

        if (this.game.gameMode === "X01") {
          dartUser.throws["overthrows"] += user.throws["overthrows"];
          dartUser.markModified('throws');
          dartUser.overAllPoints += user.allGainedPoints;

          if (user.place === 1) {
            const gameCheckout = calculatePoints(user.turns[1]) + calculatePoints(user.turns[2]) + calculatePoints(user.turns[3]);
            user.gameCheckout = gameCheckout;

            if (user.gameCheckout > dartUser.highestCheckout) {
              dartUser.highestCheckout = user.gameCheckout;
            }
          }

          if (parseFloat(user.highestGameAvg) > parseFloat(dartUser.highestEndingAvg)) {
            dartUser.highestEndingAvg = parseFloat(user.highestGameAvg);
          }
          if (parseFloat(user.highestGameTurnPoints) > parseFloat(dartUser.highestTurnPoints)) {
            dartUser.highestTurnPoints = parseFloat(user.highestGameTurnPoints);
          }
        }

        dartUser.gamesPlayed += 1;

        await dartUser.save();
      }));
    } catch (error) {
      logger.error("Error in updateUsersData", { error: error.message });
      throw error;
    }
  }

  async handlePodium() {
    const currentUser = this.getCurrentUser();
    const usersBeforeBack = await this.handleUsersBeforeBack();

    if (this.game.gameMode === "X01") {
      handlePodiumX01(this.game, currentUser);
    } else if (this.game.gameMode === "Reverse X01") {
      handlePodiumReverseX01(this.game, currentUser);
    }

    // Update user data for all players (including losers)
    await this.updateUsersData(usersBeforeBack);

    this.game.podium = {
      1: this.game.podium[1],
      2: this.game.podium[2],
      3: this.game.podium[3],
    };

    await this.updateGameState();

    this.io.to(`game-${this.gameCode}`).emit("gameEndClient", JSON.stringify(this.game));
    handleWLEDGameEnd(this.gameCode);

    const userDisplayNames = this.game.users.map(user => user.displayName);
    this.io.emit("gameEnded", JSON.stringify({
      gameCode: this.gameCode,
      userDisplayNames: userDisplayNames
    }));
  }

  async handleGameEnd() {
    const currentUser = this.getCurrentUser();
    const result = handleNextLeg(this.game, currentUser);

    if (result.endGame) {
      this.handleRecord("save");
      await this.handlePodium();
      return true;
    } else {
      this.handleRecord("save");
      await this.updateGameState(true);
      return false;
    }
  }

  async handlePoints(action, value) {
    const currentUser = this.getCurrentUser();
    const { turns } = currentUser;

    if (action) {
      if (action === 'DOUBLE') {
        turns[currentUser.currentTurn] = `D${value}`;
        if (turns[currentUser.currentTurn] === "D25") {
          handleWLEDThrowD25(this.gameCode);
        }
      } else if (action === 'TRIPLE') {
        turns[currentUser.currentTurn] = `T${value}`;
        if (turns[currentUser.currentTurn] === "T20" && !(
          turns[1] === "T20" &&
          turns[2] === "T20" &&
          turns[3] === "T20"
        )) {
          handleWLEDThrowT20(this.gameCode);
        }
      }
    }

    // Calculate turnsSum after turn value is set
    handleTurnsSum(currentUser);

    let result = { overthrow: false, gameEnd: false };
    if (this.game.gameMode === "X01") {
      result = handlePointsX01(this.game, currentUser, this.io);
    } else if (this.game.gameMode === "Reverse X01") {
      result = handlePointsReverseX01(this.game, currentUser);
    }

    currentUser._lastPointsResult = result;

    handleAvgPointsPerTurn(currentUser, this.game);

    if (result.gameEnd) {
      const fullGameEnded = await this.handleGameEnd();
      return { ...result, gameEnd: fullGameEnded, legEnded: true };
    }

    return result;
  }

  async handleThrow(value, action = null) {
    return await this._executeThrow(value, action);
  }

  async _executeThrow(value, action = null) {
    const currentUser = this.getCurrentUser();
    if (!currentUser || this.game.userWon || !currentUser.turn || this.game.active === false) {
      return { success: false, message: "Invalid game state" };
    }

    // Handle special values
    if (value === "DOORS") {
      currentUser.turns[currentUser.currentTurn] = 0;
      currentUser.throws["doors"] += 1;
      currentUser.currentThrows["doors"] += 1;

      if (this.game.gameMode === "Reverse X01") {
        currentUser.turns[currentUser.currentTurn] = doorsValueReverseX01;
      }

      handleTurnsSum(currentUser);
      const result = await this.handlePoints(null, 0);

      if (result.gameEnd) {
        return { success: true, gameEnd: true, game: this.game };
      }
      if (result.legEnded) {
        await this.updateGameState();
        return { success: true, gameEnd: false, legEnded: true, game: this.game };
      }

      handleWLEDThrowDoors(this.gameCode);
    } else if (value === "BACK") {
      return await this.handleBack();
    } else if (action === "DOUBLE" || action === "TRIPLE") {
      if (action === "DOUBLE") {
        currentUser.throws["doubles"] += 1;
        currentUser.currentThrows["doubles"] += 1;
      } else {
        currentUser.throws["triples"] += 1;
        currentUser.currentThrows["triples"] += 1;
      }

      const result = await this.handlePoints(action, value);

      if (result.gameEnd) {
        return { success: true, gameEnd: true, game: this.game };
      }
      if (result.legEnded) {
        if (result.shouldEmitOverthrow) {
          this.io.to(`game-${this.gameCode}`).emit("userOverthrowClient", currentUser.displayName);
          handleWLEDOverthrow(this.gameCode);
        }
        await this.updateGameState();
        return { success: true, gameEnd: false, legEnded: true, game: this.game };
      }
    } else {
      if (this.game.gameMode === "Reverse X01" && value === 0) {
        currentUser.turns[currentUser.currentTurn] = zeroValueReverseX01;
      } else {
        currentUser.turns[currentUser.currentTurn] = value;
      }

      currentUser.throws["normal"] += 1;
      currentUser.currentThrows["normal"] += 1;

      const result = await this.handlePoints(null, value);

      if (result.gameEnd) {
        return { success: true, gameEnd: true, game: this.game };
      }
      if (result.legEnded) {
        if (result.shouldEmitOverthrow) {
          this.io.to(`game-${this.gameCode}`).emit("userOverthrowClient", currentUser.displayName);
          handleWLEDOverthrow(this.gameCode);
        }
        await this.updateGameState();
        return { success: true, gameEnd: false, legEnded: true, game: this.game };
      }
    }

    // Handle turn progression
    if (currentUser.currentTurn === 3) {
      updateHighestTurnPoints(currentUser);

      currentUser.currentTurn = 1;

      // Check for 180
      if (currentUser.turns[1] === "T20" &&
        currentUser.turns[2] === "T20" &&
        currentUser.turns[3] === "T20") {
        handleWLEDThrow180(this.gameCode);
      }

      const nextUser = this.handleNextUser(currentUser);
      currentUser.turn = false;
      if (nextUser) nextUser.turn = true;
    } else {
      currentUser.currentTurn += 1;
    }

    const pointsResult = currentUser._lastPointsResult;
    if (pointsResult && pointsResult.shouldEmitOverthrow) {
      this.io.to(`game-${this.gameCode}`).emit("userOverthrowClient", currentUser.displayName);
      handleWLEDOverthrow(this.gameCode);
    }
    delete currentUser._lastPointsResult;

    this.handleRecord("save");
    await this.updateGameState();

    return { success: true, gameEnd: false, game: this.game };
  }

  async handleBack() {
    return await this._executeBack();
  }

  async _executeBack() {
    if (!this.game) {
      return { success: false, message: "No active game" };
    }

    if (this.game.record.length <= 1) {
      return { success: false, message: "Cannot go back - at initial state" };
    }

    if (this.dartsUsersBeforeBack.length > 0) {
      try {
        await Promise.all(
          this.dartsUsersBeforeBack.map(async (user) => {
            await DartsUser.findOneAndUpdate(
              { displayName: user.displayName },
              user,
              { new: true }
            );
          })
        );
        this.dartsUsersBeforeBack = [];
      } catch (error) {
        logger.error('Error restoring user data:', { error: error.message });
      }
    }

    // Restore game state
    this.game.active = true;
    this.game.podium = {
      1: null,
      2: null,
      3: null
    };
    this.game.userWon = "";
    this.game.finished_at = null;

    this.handleRecord("back");
    await this.updateGameState();

    handleWLEDEffectSolid(this.gameCode);

    return { success: true, game: this.game };
  }

  async enqueueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();

      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        logger.error(`Error processing queued request for ${this.gameCode}:`, { error: error.message });
        reject(error);
      }
    }

    this.isProcessing = false;
  }
}

// Manager functions
const getGameManager = async (gameCode, io) => {
  if (!gameCode) {
    logger.error('getGameManager called with empty gameCode');
    throw new Error('Invalid gameCode');
  }

  if (!activeGames.has(gameCode)) {
    try {
      const manager = new DartsGameManager(gameCode, io);
      await manager.loadGame();
      activeGames.set(gameCode, manager);
      logger.info(`Game manager created for gameCode: ${gameCode}`);
    } catch (error) {
      logger.error(`Failed to create game manager for ${gameCode}:`, { error: error.message });
      throw error;
    }
  }
  return activeGames.get(gameCode);
};

const removeGameManager = (gameCode) => {
  if (activeGames.has(gameCode)) {
    activeGames.delete(gameCode);
    logger.info(`Game manager removed for gameCode: ${gameCode}`);
  }
};

module.exports = {
  DartsGameManager,
  getGameManager,
  removeGameManager
};
