export const mongodbApiUrl = import.meta.env.VITE_MONGODB_API;

// Darts
export const getDartsUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers`);
  const users = await usersResponse.json();
  return users;
}

export const getDartsUser = async (displayName) => {
  const userResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${displayName}`);
  const user = await userResponse.json();
  return user;
}

export const putDartsUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/darts/dartsUsers/${userData.displayName}`, {
    method: "PUT",
    body: JSON.stringify({
      ...userData
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
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const postDartsGame = async (gameData) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsGames`, {
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
  return await response.json();
}

export const putDartsGame = async (gameData) => {
  await fetch(`${mongodbApiUrl}/darts/dartsGames/${gameData._id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...gameData
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const deleteDartsGame = async (gameData) => {
  await fetch(`${mongodbApiUrl}/darts/dartsGames/${gameData._id}`, {
    method: "DELETE",
  });
}

export const getDartsGames = async (userDisplayName = null, limit = 0) => {
  let url = `${mongodbApiUrl}/darts/dartsGames`;

  const queryParams = [];
  if (limit) {
    queryParams.push(`limit=${limit}`);
  }
  if (userDisplayName) {
    queryParams.push(`user=${userDisplayName}`);
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const gamesResponse = await fetch(url);
  const games = await gamesResponse.json();
  return games;
};

// FTP
export const getFiles = async () => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files`);
  const data = await response.json();
  if (data.err) return null;
  else return data;
}

export const getFile = async (filename) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${filename}`);
  const data = await response.json();
  return data.file;
}

export const uploadFile = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/upload`, {
    method: "POST",
    body: data
  });
  return await response.json();
}

export const deleteFile = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${id}`, {
    method: "DELETE"
  })
  return await response.json();
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