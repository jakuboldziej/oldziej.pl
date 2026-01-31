const { io } = require('../server');
const { addingOnlineUser, scheduleUserOffline } = require('./utils');
const { getGameManager, removeGameManager } = require('../services/dartsGameManager');
const { logger } = require('../middleware/logging');

io.on('connection', (socket) => {
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

    socket.join(`game-${joinData.gameCode}`);
  });

  socket.on("leaveLiveGamePreview", (data) => {
    const leaveData = JSON.parse(data);

    socket.leave(`game-${leaveData.gameCode}`);
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

    io.to(`game-${oldGameCode}`).emit("playAgainButtonClient", JSON.stringify(newGame));
    io.sockets.in(`game-${oldGameCode}`).socketsLeave(`game-${oldGameCode}`);
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
      const { gameCode, input } = JSON.parse(data);

      if (!gameCode) {
        console.error('[externalKeyboardInput] No gameCode provided');
        return;
      }

      const gameManager = await getGameManager(gameCode, io);
      if (!gameManager) {
        console.error(`[externalKeyboardInput] Game manager not found for gameCode: ${gameCode}`);
        return;
      }

      // Handle special actions
      if (input === "END") {
        await gameManager.handleEnd();
      } else if (input === "QUIT") {
        await gameManager.handleEnd();
      } else if (input === "BACK") {
        const errorMessage = await gameManager.handleBack();
        if (errorMessage) {
          console.error(`[externalKeyboardInput] Back error: ${errorMessage}`);
        }
      } else {
        // Regular throw input
        await gameManager.handleThrow(input);
      }
    } catch (error) {
      console.error('[externalKeyboardInput] Error:', error);
    }
  });

  socket.on("externalKeyboardPlayAgain", (data) => {
    const { gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("externalKeyboardPlayAgainClient", JSON.stringify(gameCode));
  });

  // Darts Game Logic - Server-side game management

  socket.on("game:throw", async (data) => {
    try {
      const { gameCode, value, action } = JSON.parse(data);

      if (!gameCode) {
        socket.emit("game:throw-result", JSON.stringify({ success: false, message: "Invalid gameCode" }));
        return;
      }

      const gameManager = await getGameManager(gameCode, io);
      const result = await gameManager.handleThrow(value, action);

      if (result.success) {
        // Game state is already emitted by updateGameState in the manager
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

      if (!gameCode) {
        socket.emit("game:back-result", JSON.stringify({ success: false, message: "Invalid gameCode" }));
        return;
      }

      const gameManager = await getGameManager(gameCode, io);
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

  socket.on('disconnect', () => {
    scheduleUserOffline(socket.id, io);
  });

  socket.on('connection_error', (err) => {
    console.error(err)
  });
});