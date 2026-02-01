export const ensureGameRecord = (gameData) => {
  if (!gameData) return gameData;
  
  if (!gameData.record || gameData.record.length === 0) {
    gameData.record = [{
      game: {
        round: gameData.round,
        turn: gameData.turn
      },
      users: gameData.users.map(user => ({ ...user }))
    }];
  }
  
  return gameData;
};

export const getLatestRecord = (game) => {
  if (!game?.record || game.record.length === 0) return null;
  return game.record[game.record.length - 1];
};

export const isInitialGameState = (game) => {
  return !game?.record || game.record.length <= 1;
};
