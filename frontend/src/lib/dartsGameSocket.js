import { socket, ensureSocketConnection, trackRoom, untrackRoom } from '@/lib/socketio';

export const sendThrow = async (gameCode, value, action = null) => {
  await ensureSocketConnection();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Throw timeout - check your connection'));
    }, 5000);

    socket.emit("game:throw", JSON.stringify({ gameCode, value, action }));

    const handleResult = (data) => {
      clearTimeout(timeout);
      socket.off("game:throw-result", handleResult);
      const result = JSON.parse(data);
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.message || 'Throw failed'));
      }
    };

    socket.on("game:throw-result", handleResult);
  });
};

export const sendBack = async (gameCode) => {
  await ensureSocketConnection();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Back timeout - check your connection'));
    }, 5000);

    socket.emit("game:back", JSON.stringify({ gameCode }));

    const handleResult = (data) => {
      clearTimeout(timeout);
      socket.off("game:back-result", handleResult);
      const result = JSON.parse(data);
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.message || 'Back failed'));
      }
    };

    socket.on("game:back-result", handleResult);
  });
};

export const endGame = (gameCode, game = null) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('End game timeout'));
    }, 5000);

    socket.emit("game:end", JSON.stringify({ gameCode, game }));

    const handleResult = (data) => {
      clearTimeout(timeout);
      socket.off("game:end-result", handleResult);
      const result = JSON.parse(data);
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.message || 'End game failed'));
      }
    };

    socket.on("game:end-result", handleResult);
  });
};

export const subscribeToGameUpdates = (gameCode, callback) => {
  const handler = (data) => {
    try {
      const game = JSON.parse(data);
      callback(game);
    } catch (error) {
      console.error('Error parsing game update:', error);
    }
  };

  socket.on("updateLiveGamePreviewClient", handler);

  return () => {
    socket.off("updateLiveGamePreviewClient", handler);
  };
};

export const subscribeToOverthrows = (callback) => {
  socket.on("userOverthrowClient", callback);

  return () => {
    socket.off("userOverthrowClient", callback);
  };
};

export const subscribeToGameEnd = (callback) => {
  const handler = (data) => {
    try {
      const game = JSON.parse(data);
      callback(game);
    } catch (error) {
      console.error('Error parsing game end:', error);
    }
  };

  socket.on("gameEndClient", handler);

  return () => {
    socket.off("gameEndClient", handler);
  };
};

export const subscribeToPlayAgain = (callback) => {
  const handler = (data) => {
    try {
      const game = JSON.parse(data);
      callback(game);
    } catch (error) {
      console.error('Error parsing game end:', error);
    }
  };

  socket.on("playAgainButtonClient", handler);

  return () => {
    socket.off("playAgainButtonClient", handler);
  };
};

export const subscribeToCreateNewGame = (callback) => {
  const handler = (data) => {
    try {
      const game = JSON.parse(data);
      callback(game);
    } catch (error) {
      console.error('Error parsing game end:', error);
    }
  };

  socket.on("createNewGameClient", handler);

  return () => {
    socket.off("createNewGameClient", handler);
  };
};

export const joinGameRoom = (gameCode) => {
  if (!gameCode) {
    console.error('joinGameRoom called with empty gameCode');
    return;
  }
  trackRoom(gameCode);
  socket.emit("joinLiveGamePreview", JSON.stringify({ gameCode }));

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn(`Join confirmation timeout for game ${gameCode}`);
      resolve(false);
    }, 3000);

    const handleJoined = (data) => {
      if (data.gameCode === gameCode) {
        clearTimeout(timeout);
        socket.off("game:joined", handleJoined);
        resolve(true);
      }
    };

    socket.on("game:joined", handleJoined);
  });
};

export const leaveGameRoom = (gameCode) => {
  if (!gameCode) {
    console.error('leaveGameRoom called with empty gameCode');
    return;
  }
  untrackRoom(gameCode);
  socket.emit("leaveLiveGamePreview", JSON.stringify({ gameCode }));
};

export const sendExternalKeyboardInput = (gameCode, input) => {
  socket.emit("externalKeyboardInput", JSON.stringify({ gameCode, input }));
};
