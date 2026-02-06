const { io } = require('../server');
const { addingOnlineUser, scheduleUserOffline } = require('./utils');
const { getGameManager, removeGameManager } = require('../services/dartsGameManager');
const { logger } = require('../middleware/logging');
const DartsGame = require('../models/dartsGame');

const socketAuthMiddleware = (socket, next) => {
  const handshake = socket.handshake;

  logger.info(`Socket connection attempt from ${socket.id}`, {
    address: handshake.address,
    headers: handshake.headers.origin
  });

  // token validation?
  next();
};

io.use(socketAuthMiddleware);

// Connection health monitoring
const activeConnections = new Map();

io.on('connection', (socket) => {
  activeConnections.set(socket.id, {
    connectedAt: Date.now(),
    lastHeartbeat: Date.now(),
    address: socket.handshake.address
  });

  socket.on('heartbeat', () => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      connection.lastHeartbeat = Date.now();
    }
    socket.emit('heartbeat-ack', { timestamp: Date.now() });
  });

  socket.on('ping', (callback) => {
    if (typeof callback === 'function') {
      callback({ timestamp: Date.now() });
    }
  });

  // Listeners

  // Admin Listeners

  socket.on("verifyEmailAdmin", (data) => {
    const verifyData = JSON.parse(data);

    io.emit("verifyEmail", JSON.stringify({
      userDisplayName: verifyData.userDisplayName,
      verified: verifyData.verified
    }));
  });

  // Live game

  socket.on("joinLiveGamePreview", (data) => {
    const joinData = JSON.parse(data);
    const newRoom = `game-${joinData.gameCode}`;

    const currentRooms = Array.from(socket.rooms);
    for (const room of currentRooms) {
      if (room.startsWith('game-') && room !== newRoom) {
        socket.leave(room);
      }
    }

    socket.join(newRoom);

    socket.emit("game:joined", {
      gameCode: joinData.gameCode,
      timestamp: Date.now()
    });
  });

  socket.on("leaveLiveGamePreview", (data) => {
    const leaveData = JSON.parse(data);
    const room = `game-${leaveData.gameCode}`;

    socket.leave(room);
  });

  socket.on("joinLiveGameFromQrCode", (data) => {
    const joinData = JSON.parse(data);

    io.to(joinData.socketId).emit("joinLiveGameFromQrCodeClient", JSON.stringify(sendData));
  });

  socket.on("updateLiveGamePreview", (data) => {
    const gameData = JSON.parse(data);

    io.to(`game-${gameData.gameCode}`).emit("updateLiveGamePreviewClient", JSON.stringify(gameData));
  });

  // Live game preview events

  socket.on("playAgainButtonServer", (data) => {
    const playAgainData = JSON.parse(data);
    const oldGameCode = playAgainData.oldGameCode;
    const newGame = playAgainData.newGame;

    // Clean up old game manager
    removeGameManager(oldGameCode);

    const oldRoom = `game-${oldGameCode}`;

    io.to(oldRoom).emit("playAgainButtonClient", JSON.stringify(newGame));

    io.sockets.in(oldRoom).socketsLeave(oldRoom);
  });

  socket.on("userOverthrow", (data) => {
    const { userDisplayName, gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("userOverthrowClient", userDisplayName);
  });

  socket.on("hostDisconnectedFromGame", (data) => {
    const { gameCode } = JSON.parse(data);

    // Clean up game manager
    removeGameManager(gameCode);

    io.to(`game-${gameCode}`).emit("hostDisconnectedFromGameClient", true);
    io.sockets.in(`game-${gameCode}`).socketsLeave(`game-${gameCode}`);
  });

  // Mobile App Inputs

  socket.on("externalKeyboardInput", async (data) => {
    try {
      const { gameCode, input, action } = JSON.parse(data);

      if (!gameCode) {
        logger.error('[externalKeyboardInput] No gameCode provided');
        socket.emit('externalKeyboardInput:error', { message: 'No gameCode provided' });
        return;
      }

      const gameManager = await getGameManager(gameCode, io);
      if (!gameManager) {
        logger.error(`[externalKeyboardInput] Game manager not found for gameCode: ${gameCode}`);
        socket.emit('externalKeyboardInput:error', { message: 'Game not found' });
        return;
      }

      let result;
      if (input === "BACK") {
        result = await gameManager.handleBack();
      } else {
        result = await gameManager.handleThrow(input, action);
      }

      if (result && !result.success) {
        socket.emit('externalKeyboardInput:error', { message: result.message });
      } else {
        socket.emit('externalKeyboardInput:success', { input, action });
      }
    } catch (error) {
      logger.error('[externalKeyboardInput] Error:', { error: error.message });
      socket.emit('externalKeyboardInput:error', { message: error.message });
    }
  });

  const createPlayAgainGame = async (gameCode, socket, eventName) => {
    const currentGame = await DartsGame.findOne({ gameCode: gameCode });
    if (!currentGame) {
      socket.emit(`${eventName}:error`, { message: 'Game not found' });
      return null;
    }

    const throwsData = {
      doors: 0,
      doubles: 0,
      triples: 0,
      normal: 0,
      overthrows: 0,
    };

    const resetUsers = currentGame.users.map((user) => {
      const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
      return {
        _id: userObj._id,
        displayName: userObj.displayName,
        visibleName: userObj.visibleName,
        points: parseInt(currentGame.startPoints),
        allGainedPoints: 0,
        turn: false,
        turnsSum: 0,
        currentTurn: 1,
        place: 0,
        turns: { 1: null, 2: null, 3: null },
        throws: { ...throwsData },
        currentThrows: { ...throwsData },
        legs: 0,
        sets: 0,
        totalLegsWon: 0,
        avgPointsPerTurn: "0.00",
        highestGameAvg: "0.00",
        highestGameTurnPoints: 0,
        gameCheckout: 0,
      };
    });

    resetUsers.reverse();
    resetUsers[0].turn = true;

    let newGameCode;
    do {
      newGameCode = Math.floor(1000 + Math.random() * 9000).toString();
    } while (await DartsGame.findOne({ gameCode: newGameCode }));

    const initialRecord = [{
      game: {
        round: 1,
        turn: resetUsers[0].displayName
      },
      users: resetUsers.map(user => ({ ...user }))
    }];

    const newGame = new DartsGame({
      created_by: currentGame.created_by,
      created_at: Date.now(),
      users: resetUsers,
      podiums: currentGame.podiums,
      podium: { 1: null, 2: null, 3: null },
      turn: resetUsers[0].displayName,
      active: true,
      gameMode: currentGame.gameMode,
      startPoints: currentGame.startPoints,
      checkOut: currentGame.checkOut,
      sets: currentGame.sets,
      legs: currentGame.legs,
      round: 1,
      gameCode: newGameCode,
      training: currentGame.training,
      record: initialRecord,
    });

    const savedGame = await newGame.save();

    removeGameManager(gameCode);

    const oldRoom = `game-${gameCode}`;

    const socketsInRoom = io.sockets.adapter.rooms.get(oldRoom);

    io.to(oldRoom).emit("playAgainButtonClient", JSON.stringify(savedGame));

    return savedGame;
  };

  socket.on("externalKeyboardPlayAgain", async (data) => {
    const { gameCode } = JSON.parse(data);

    try {
      await createPlayAgainGame(gameCode, socket, 'externalKeyboardPlayAgain');
    } catch (error) {
      logger.error('[externalKeyboardPlayAgain] Error:', { error: error.message });
      socket.emit('externalKeyboardPlayAgain:error', { message: error.message });
    }
  });

  socket.on("playAgainRequest", async (data) => {
    const { gameCode } = JSON.parse(data);

    try {
      await createPlayAgainGame(gameCode, socket, 'playAgainRequest');
    } catch (error) {
      logger.error('[playAgainRequest] Error:', { error: error.message });
      socket.emit('playAgainRequest:error', { message: error.message });
    }
  });

  // Darts Game Logic - Server-side game management

  // Helper function to validate game manager access
  const validateGameAccess = async (socket, gameCode) => {
    if (!gameCode) {
      socket.emit('error', { message: 'Invalid gameCode' });
      return null;
    }

    try {
      const gameManager = await getGameManager(gameCode, io);
      if (!gameManager || !gameManager.game) {
        socket.emit('error', { message: 'Game not found or no longer active' });
        return null;
      }
      return gameManager;
    } catch (error) {
      logger.error(`Error accessing game ${gameCode}:`, { error: error.message });
      socket.emit('error', { message: 'Failed to access game' });
      return null;
    }
  };

  socket.on("game:throw", async (data) => {
    try {
      const { gameCode, value, action } = JSON.parse(data);

      const gameManager = await validateGameAccess(socket, gameCode);
      if (!gameManager) return;

      const result = await gameManager.handleThrow(value, action);

      if (result.success) {
        socket.emit("game:throw-result", JSON.stringify({ success: true, gameEnd: result.gameEnd }));
      } else {
        socket.emit("game:throw-result", JSON.stringify({ success: false, message: result.message }));
      }
    } catch (error) {
      console.error("Error handling throw:", error);
      socket.emit("game:throw-result", JSON.stringify({ success: false, message: error.message }));
    }
  });

  socket.on("game:back", async (data) => {
    try {
      const { gameCode } = JSON.parse(data);

      const gameManager = await validateGameAccess(socket, gameCode);
      if (!gameManager) return;

      const result = await gameManager.handleBack();

      if (result.success) {
        socket.emit("game:back-result", JSON.stringify({ success: true }));
      } else {
        socket.emit("game:back-result", JSON.stringify({ success: false, message: result.message }));
      }
    } catch (error) {
      console.error("Error handling back:", error);
      socket.emit("game:back-result", JSON.stringify({ success: false, message: error.message }));
    }
  });

  socket.on("game:end", async (data) => {
    try {
      const { gameCode, game: endedGame } = JSON.parse(data);

      if (endedGame) {
        io.to(`game-${gameCode}`).emit("gameEndClient", JSON.stringify(endedGame));

        const userDisplayNames = endedGame.users.map(user => user.displayName);
        io.emit("gameEnded", JSON.stringify({
          gameCode: gameCode,
          userDisplayNames: userDisplayNames
        }));

        if (endedGame._id) {
          await DartsGame.findByIdAndDelete(endedGame._id);
        }
      }

      removeGameManager(gameCode);
      socket.emit("game:end-result", JSON.stringify({ success: true }));
    } catch (error) {
      console.error("Error ending game:", error);
      socket.emit("game:end-result", JSON.stringify({ success: false, message: error.message }));
    }
  });

  // Handling Online Users

  socket.on("addingOnlineUser", (data) => {
    addingOnlineUser(data, socket.id, io);
  });

  // ESP 32 

  // Wifi connection

  socket.on("esp32:connection-info", (data) => {
    io.emit("esp32:connection-info", data);
  });

  socket.on("esp32-door:check-wifi-connection", (data) => {
    io.emit("esp32-door:check-wifi-connection", data);
  });

  // DoorState

  socket.on("esp32:checkDoorsState", (data) => {
    io.emit("esp32:checkDoorsState", { requester: data.requester });
  });

  socket.on("esp32:doorState-response", (data) => {
    io.to(data.requester).emit("esp32:doorState-response", data.state);
  });

  // Connections

  socket.on('disconnect', (reason) => {
    activeConnections.delete(socket.id);
    scheduleUserOffline(socket.id, io);
  });

  socket.on('connection_error', (err) => {
    logger.error(`Connection error for ${socket.id}:`, { error: err.message });
    console.error(err);
  });

  socket.on('error', (err) => {
    logger.error(`Socket error for ${socket.id}:`, { error: err.message });
  });
});

// Periodic health check
setInterval(() => {
  const now = Date.now();
  const staleTimeout = 60000; // 60 seconds

  activeConnections.forEach((connection, socketId) => {
    if (now - connection.lastHeartbeat > staleTimeout) {
      logger.warn(`Removing stale connection: ${socketId}`);
      activeConnections.delete(socketId);
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.disconnect(true);
      }
    }
  });
}, 30000); // 30 seconds