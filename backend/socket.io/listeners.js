const { io } = require('../server');
const { addingOnlineUser, scheduleUserOffline } = require('./utils');

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

    io.to(`game-${oldGameCode}`).emit("playAgainButtonClient", JSON.stringify(newGame));
    io.sockets.in(`game-${oldGameCode}`).socketsLeave(`game-${oldGameCode}`);
  });

  socket.on("userOverthrow", (data) => {
    const { userDisplayName, gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("userOverthrowClient", userDisplayName);
  });

  socket.on("hostDisconnectedFromGame", (data) => {
    const { gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("hostDisconnectedFromGameClient", true);
    io.sockets.in(`game-${gameCode}`).socketsLeave(`game-${gameCode}`);
  });

  // Mobile App Inputs

  socket.on("externalKeyboardInput", (data) => {
    const { gameCode, input } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("externalKeyboardInputClient", JSON.stringify(input));
  });

  socket.on("externalKeyboardPlayAgain", (data) => {
    const { gameCode } = JSON.parse(data);

    io.to(`game-${gameCode}`).emit("externalKeyboardPlayAgainClient", JSON.stringify(gameCode));
  });

  // Handling Online Users

  socket.on("addingOnlineUser", (data) => {
    addingOnlineUser(data, socket.id, io);
  });

  // Connections

  socket.on('disconnect', () => {
    scheduleUserOffline(socket.id, io);
  });

  socket.on('connection_error', (err) => {
    console.error(err)
  });
});