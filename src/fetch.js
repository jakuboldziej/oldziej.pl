export const mongodbApiUrl = import.meta.env.VITE_MONGODB_API;

// Darts
export const getDartsUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers`);
  const users = await usersResponse.json();
  return users;
}

export const getDartsUser = async (uDisplayName) => {
  const userResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${uDisplayName}`);
  const user = await userResponse.json();
  return user;
}

export const updateDartsUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/users/:displayName`, {
    method: "PUT",
    body: JSON.stringify({
      displayName: userData?.displayName,
      gamesPlayed: userData?.gamesPlayed,
      podiums: userData?.podiums,
      overAllPoints: userData?.overAllPoints,
      highestEndingAvg: userData?.highestEndingAvg,
      highestOuts: userData?.highestOuts,
      highestRoundPoints: userData?.highestRoundPoints,
      throws: userData?.throws,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const postDartsUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/darts/dartsUsers`, {
    method: "POST",
    body: JSON.stringify({
      displayName: userData.displayName,
      gamesPlayed: userData.gamesPlayed,
      podiums: userData.podiums,
      overAllPoints: userData.overAllPoints,
      highestEndingAvg: userData.highestEndingAvg,
      highestOuts: userData.highestOuts,
      highestRoundPoints: userData.highestRoundPoints,
      throws: userData.throws,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const postDartsGame = async (gameData) => {
  await fetch(`${mongodbApiUrl}/darts/dartsGames`, {
    method: "POST",
    body: JSON.stringify({
      created_at: gameData.created_at,
      created_by: gameData.created_by,
      users: gameData.users,
      podiums: gameData.podiums,
      podium: gameData.podium,
      turn: gameData.turn,
      active: gameData.active,
      gameMode: gameData.gameMode,
      startPoints: gameData.startPoints,
      checkOut: gameData.checkOut,
      sets: gameData.sets,
      legs: gameData.legs,
      round: gameData.round,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export const getDartsGames = async () => {
  const gamesResponse = await fetch(`${mongodbApiUrl}/darts/dartsGames`);
  const games = await gamesResponse.json();
  return games;
}

// Users
export const getUser = async (uDisplayName) => {
  const userResponse = await fetch(`${mongodbApiUrl}/users/${uDisplayName}`);
  const user = await userResponse.json();
  return user;
}

export const postUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/users`, {
    method: "POST",
    body: JSON.stringify({
      displayName: userData.displayName,
      email: userData.email
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}