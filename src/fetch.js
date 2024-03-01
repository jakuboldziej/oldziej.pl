export const mongodbApiUrl = import.meta.env.VITE_MONGODB_API;

// Darts
export const getDartsUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers`);
  const users = await usersResponse.json();
  return users;
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
  await fetch(`${mongodbApiUrl}/dartsGames`, {
    method: "POST",
    body: JSON.stringify({
      created_by: gameData.user.displayName,
      users: gameData.updatedUsers,
      podiums: gameData.usersPodium,
      podium: {
        1: null,
        2: null,
        3: null
      },
      turn: gameData.updatedUsers[0].displayName,
      active: true,
      gameMode: gameData.selectGameMode,
      startPoints: gameData.selectStartPoints,
      checkOut: gameData.selectCheckOut,
      sets: gameData.selectSets,
      legs: gameData.selectLegs,
      round: 1,
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