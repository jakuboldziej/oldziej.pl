const { io } = require('../server');
const { addingOnlineUser, scheduleUserOffline } = require('./utils');
const { getGameManager, removeGameManager } = require('../services/dartsGameManager');
const { logger } = require('../middleware/logging');
const DartsGame = require('../models/darts/dartsGame');
const DartsTournament = require('../models/darts/dartsTournament');
const dartsTournamentManager = require('../services/dartsTournamentManager');
const { getInitialUsersGameState } = require('../lib/dartsUtils');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { userRoom, gameRoom } = require('./rooms');
require('dotenv').config();

const extractHandshakeToken = (handshake) => {
  const raw = handshake.auth?.token
    || handshake.query?.token
    || handshake.headers?.authorization;

  if (!raw || typeof raw !== 'string') return null;
  if (raw === 'undefined' || raw === 'null') return null;

  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
};

const socketAuthMiddleware = async (socket, next) => {
  const token = extractHandshakeToken(socket.handshake);

  if (!token) return next();

  try {
    if (process.env.SERVICE_API_KEY && token === process.env.SERVICE_API_KEY) {
      socket.data.user = { _id: 'service', displayName: 'service', role: 'admin', isService: true };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId, { password: 0 });

    if (user) {
      socket.data.user = {
        _id: user._id.toString(),
        displayName: user.displayName,
        role: user.role
      };
      socket.join(userRoom(user._id.toString()));
    }
  } catch (error) {
    logger.warn('Socket handshake token rejected', { socketId: socket.id, error: error.message });
  }

  next();
};

io.use(socketAuthMiddleware);

const requireSocketUser = (socket, event) => {
  if (socket.data.user) return socket.data.user;

  socket.emit('error', { message: `Not authorized for ${event}.` });
  return null;
};

const requireSocketAdmin = (socket, event) => {
  const user = requireSocketUser(socket, event);
  if (!user) return null;
  if (user.role === 'admin') return user;

  socket.emit('error', { message: `Admin privileges required for ${event}.` });
  return null;
};

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
    if (!requireSocketAdmin(socket, "verifyEmailAdmin")) return;

    try {
      const verifyData = JSON.parse(data);

      io.emit("verifyEmail", JSON.stringify({
        userDisplayName: verifyData.userDisplayName,
        verified: verifyData.verified
      }));
    } catch (error) {
      logger.error("Error handling verifyEmailAdmin:", { error: error.message });
    }
  });

  // Live game

  socket.on("joinLiveGamePreview", (data) => {
    try {
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
    } catch (error) {
      logger.error("Error handling joinLiveGamePreview:", { error: error.message });
    }
  });

  socket.on("leaveLiveGamePreview", (data) => {
    try {
      const leaveData = JSON.parse(data);
      const room = `game-${leaveData.gameCode}`;

      socket.leave(room);
    } catch (error) {
      logger.error("Error handling leaveLiveGamePreview:", { error: error.message });
    }
  });

  socket.on("joinLiveGameFromQrCode", (data) => {
    try {
      const joinData = JSON.parse(data);

      io.to(joinData.socketId).emit("joinLiveGameFromQrCodeClient", JSON.stringify(joinData));
    } catch (error) {
      logger.error("Error handling joinLiveGameFromQrCode:", { error: error.message });
    }
  });

  socket.on("updateLiveGamePreview", (data) => {
    if (!requireSocketUser(socket, "updateLiveGamePreview")) return;

    try {
      const gameData = JSON.parse(data);

      io.to(`game-${gameData.gameCode}`).emit("updateLiveGamePreviewClient", JSON.stringify(gameData));
    } catch (error) {
      logger.error("Error handling updateLiveGamePreview:", { error: error.message });
    }
  });

  // Live game preview events

  socket.on("playAgainButtonServer", (data) => {
    if (!requireSocketUser(socket, "playAgainButtonServer")) return;

    try {
      const playAgainData = JSON.parse(data);
      const oldGameCode = playAgainData.oldGameCode;
      const newGame = playAgainData.newGame;

      // Clean up old game manager
      removeGameManager(oldGameCode);

      const oldRoom = `game-${oldGameCode}`;

      io.to(oldRoom).emit("playAgainButtonClient", JSON.stringify(newGame));

      io.sockets.in(oldRoom).socketsLeave(oldRoom);
    } catch (error) {
      logger.error("Error handling playAgainButtonServer:", { error: error.message });
    }
  });

  socket.on("userOverthrow", (data) => {
    if (!requireSocketUser(socket, "userOverthrow")) return;

    try {
      const { userDisplayName, gameCode } = JSON.parse(data);

      io.to(`game-${gameCode}`).emit("userOverthrowClient", userDisplayName);
    } catch (error) {
      logger.error("Error handling userOverthrow:", { error: error.message });
    }
  });

  socket.on("hostDisconnectedFromGame", (data) => {
    if (!requireSocketUser(socket, "hostDisconnectedFromGame")) return;

    try {
      const { gameCode } = JSON.parse(data);

      // Clean up game manager
      removeGameManager(gameCode);

      io.to(`game-${gameCode}`).emit("hostDisconnectedFromGameClient", true);
      io.sockets.in(`game-${gameCode}`).socketsLeave(`game-${gameCode}`);
    } catch (error) {
      logger.error("Error handling hostDisconnectedFromGame:", { error: error.message });
    }
  });

  // Mobile App Inputs

  socket.on("externalKeyboardInput", async (data) => {
    if (!requireSocketUser(socket, "externalKeyboardInput")) return;

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

  const createPlayAgainGame = async (gameData, socket, eventName) => {
    const currentGame = gameData;

    if (!currentGame) {
      socket.emit(`${eventName}:error`, { message: 'Game data missing' });
      return null;
    }

    const rawUsers = currentGame.users.map(user =>
      typeof user.toObject === "function" ? user.toObject() : user
    );

    rawUsers.unshift(rawUsers.pop());

    const resetUsers = getInitialUsersGameState(rawUsers, currentGame.startPoints, false);

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

    removeGameManager(currentGame.gameCode);

    const oldRoom = `game-${currentGame.gameCode}`;
    io.to(oldRoom).emit("playAgainButtonClient", JSON.stringify(savedGame));

    return savedGame;
  };

  socket.on("externalKeyboardPlayAgain", async (data) => {
    if (!requireSocketUser(socket, "externalKeyboardPlayAgain")) return;

    try {
      const { gameData } = JSON.parse(data);

      await createPlayAgainGame(gameData, socket, 'externalKeyboardPlayAgain');
    } catch (error) {
      logger.error('[externalKeyboardPlayAgain] Error:', { error: error.message });
      socket.emit('externalKeyboardPlayAgain:error', { message: error.message });
    }
  });

  socket.on("playAgainRequest", async (data) => {
    if (!requireSocketUser(socket, "playAgainRequest")) return;

    try {
      const { gameData } = JSON.parse(data);

      await createPlayAgainGame(gameData, socket, 'playAgainRequest');
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

    if (!requireSocketUser(socket, 'game actions')) return null;

    if (!socket.rooms.has(gameRoom(gameCode))) {
      socket.emit('error', { message: 'Join the game preview before sending game actions.' });
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
    if (!requireSocketUser(socket, "game:end")) return;

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

  // Darts Tournament

  socket.on("joinTournamentControl", (tournamentCode) => {
    socket.join(`tournament-spectator-${tournamentCode}`);

    logger.info(`User joined spectator room for tournament: ${tournamentCode}`);
  });

  socket.on("leaveTournamentControl", (tournamentCode) => {
    socket.leave(`tournament-spectator-${tournamentCode}`);

    logger.info(`Socket ${socket.id} left tournament ${tournamentCode}`);
  });

  socket.on("tournamentNextGame", async ({ tournamentCode, currentGameCode }) => {
    if (!requireSocketUser(socket, "tournamentNextGame")) return;

    try {
      const tournament = await DartsTournament.findOne({ tournamentCode }).populate({
        path: "matches",
        select: "status round player1 player2 winner gameId"
      });

      if (!tournament) return;

      const rounds = tournament.matches.map(m => m.round);
      const currentRound = Math.min(
        ...rounds.filter(r =>
          tournament.matches.some(m => m.round === r && m.status !== 'completed')
        )
      );

      const matchesInRound = tournament.matches.filter(
        m => m.round === currentRound && m.player1 && m.player2 && m.gameId
      );

      matchesInRound.forEach(match => {
        if (match.status !== 'completed') {
          match.status = 'active';
        }
      });
      await Promise.all(matchesInRound.map(m => m.save()));

      const nextMatch = matchesInRound.find(m => m.status === 'active');
      if (!nextMatch) {
        return;
      }

      nextMatch.status = "active";
      await nextMatch.save();

      const nextGame = await DartsGame.findById(nextMatch.gameId);

      io.to(`game-${currentGameCode}`).emit("tournament:nextGame", {
        nextGame
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("tournamentBack", async ({ tournamentId, matchId }) => {
    if (!requireSocketUser(socket, "tournamentBack")) return;

    try {
      const updatedTournament =
        await dartsTournamentManager.revertTournamentMatch(
          tournamentId,
          matchId
        );

      io.to(`tournament-spectator-${updatedTournament.tournamentCode}`)
        .emit("tournamentUpdated", updatedTournament);
    } catch (error) {
      logger.error('[tournamentBack] Error:', { error: error.message });
      socket.emit('tournamentBack:error', { message: error.message });
    }
  });

  // Handling Online Users

  socket.on("addingOnlineUser", () => {
    const user = requireSocketUser(socket, "addingOnlineUser");
    if (!user || user.isService) return;

    addingOnlineUser({ user: { _id: user._id, displayName: user.displayName } }, socket.id, io);
  });

  socket.on("user:logout", () => {
    scheduleUserOffline(socket.id, io, 0);
  });

  // ESP 32 

  // Wifi connection

  socket.on("esp32:connection-info", (data) => {
    if (!requireSocketUser(socket, "esp32:connection-info")) return;
    io.emit("esp32:connection-info", data);
  });

  socket.on("esp32-door:check-wifi-connection", (data) => {
    if (!requireSocketUser(socket, "esp32-door:check-wifi-connection")) return;
    io.emit("esp32-door:check-wifi-connection", data);
  });

  // DoorState

  socket.on("esp32:checkDoorsState", (data) => {
    if (!requireSocketUser(socket, "esp32:checkDoorsState")) return;

    try {
      io.emit("esp32:checkDoorsState", { requester: data.requester });
    } catch (error) {
      logger.error("Error handling esp32:checkDoorsState:", { error: error.message });
    }
  });

  socket.on("esp32:doorState-response", (data) => {
    if (!requireSocketUser(socket, "esp32:doorState-response")) return;

    try {
      io.to(data.requester).emit("esp32:doorState-response", data.state);
    } catch (error) {
      logger.error("Error handling esp32:doorState-response:", { error: error.message });
    }
  });

  // Connections

  socket.on('disconnect', (reason) => {
    activeConnections.delete(socket.id);

    // Leave all tournament rooms
    socket.rooms.forEach(room => {
      socket.leave(room);
    });

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