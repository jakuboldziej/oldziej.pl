export const mongodbApiUrl = import.meta.env.MODE === "development" ? import.meta.env.VITE_DOMAIN_LOCAL + "/api" : import.meta.env.VITE_DOMAIN + "/api";

// Darts

// Games

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
  });
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

export const deleteDartsGame = async (gameId) => {
  await fetch(`${mongodbApiUrl}/darts/dartsGames/${gameId}`, {
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
}

export const joinLiveGamePreview = async (gameCode) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsGames/join-live-game-preview/${gameCode}`, {
    method: "POST",
  });
  return await response.json();
}

// Users

export const getDartsUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers`);
  const users = await usersResponse.json();
  return users;
}

export const getDartsUser = async (identifier) => {
  const userResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${identifier}`);
  const user = await userResponse.json();
  return user;
}

export const putDartsUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${userData.displayName}`, {
    method: "PUT",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

export const deleteDartsUser = async (displayName) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${displayName}`, {
    method: "DELETE"
  })
  return await response.json();
}

export const postDartsUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsUsers`, {
    method: "POST",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

// Cloud

// Users
export const postFtpUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/ftp/users`, {
    method: "POST",
    body: JSON.stringify({
      displayName: userData.displayName,
      email: userData.email,
      main_folder: userData.main_folder
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const getFtpUser = async (uDisplayName) => {
  const userResponse = await fetch(`${mongodbApiUrl}/ftp/users/${uDisplayName}`);
  const user = await userResponse.json();
  return user;
}

export const getFtpUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/ftp/users`);
  const users = await usersResponse.json();
  return users;
}

export const deleteFtpUser = async (displayName) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/users/${displayName}`, {
    method: "DELETE"
  })
  return await response.json();
}

export const putFtpUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/ftp/users/${userData.displayName}`, {
    method: "PUT",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Files
export const getFiles = async (userDisplayName = null) => {
  let url = `${mongodbApiUrl}/ftp/files`;

  const queryParams = [];
  if (userDisplayName) {
    queryParams.push(`user=${userDisplayName}`)
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export const getFile = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${id}`);
  const data = await response.json();
  return data.file;
}

export const uploadFile = async (data) => {
  const uploadResponse = await fetch(`${mongodbApiUrl}/ftp/upload?userDisplayName=${data.get("userDisplayName")}`, {
    method: "POST",
    body: data,
  });
  const uploadFile = await uploadResponse.json();

  const ftpFileRes = await fetch(`${mongodbApiUrl}/ftp/files`, {
    method: "POST",
    body: JSON.stringify({
      fileId: uploadFile.file.id,
      owner: uploadFile.file.metadata.owner,
      favorite: false,
      lastModified: data.get("lastModified"),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const ftpFile = await ftpFileRes.json();
  return ftpFile;
}

export const deleteFile = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${id}`, {
    method: "DELETE"
  })
  return await response.json();
}

export const deleteFolder = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders/${id}`, {
    method: "DELETE"
  })
  return await response.json();
}

export const putFile = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${data.file._id}`, {
    method: "PUT",
    body: JSON.stringify({
      data: data,
      newFileName: data?.newFileName || null
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  const fileRes = await response.json();
  return fileRes.file;
}

// Folders
export const postFolder = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders`, {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      owner: data.owner,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  const folderRes = await response.json();
  return folderRes.folder;
}

export const getFolders = async (userDisplayName = null, folderName = null) => {
  let url = `${mongodbApiUrl}/ftp/folders`;

  const queryParams = [];
  if (userDisplayName) {
    queryParams.push(`user=${userDisplayName}`)
  }
  if (folderName) {
    queryParams.push(`folderName=${folderName}`)
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await fetch(url);
  const data = await response.json();
  return data.folders;
}

export const getFolder = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders/${id}`);
  const data = await response.json();
  return data.folder;
}

export const putFolder = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders/${data.folder._id}`, {
    method: "PUT",
    body: JSON.stringify({
      data: data,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  const folderRes = await response.json();
  return folderRes.folder;
}

// Auth Users
export const getAuthUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/auth/users`);
  const users = await usersResponse.json();
  return users;
}

export const getAuthUser = async (identifier) => {
  const usersResponse = await fetch(`${mongodbApiUrl}/auth/users/${identifier}`);
  const user = await usersResponse.json();
  return user;
}

export const checkIfUserWithEmailExists = async (email) => {
  const usersResponse = await fetch(`${mongodbApiUrl}/auth/users/check-existing-mail/${email}`);
  const user = await usersResponse.json();
  return user;
}

export const putAuthUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/auth/users/${userData.displayName}`, {
    method: "PUT",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const deleteAuthUser = async (displayName) => {
  const response = await fetch(`${mongodbApiUrl}/auth/users/${displayName}`, {
    method: "DELETE"
  })
  return await response.json();
}

export const loginUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      displayName: userData.displayName,
      password: userData.password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: userData.email,
      displayName: userData.displayName,
      password: userData.password,
      friendsCode: userData.friendsCode
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
}

// Friends
export const checkIfCurrentUserIsFriendsWithUser = async (currentUserDisplayName, userDisplayName) => {
  const usersResponse = await fetch(`${mongodbApiUrl}/auth/users/check-if-friends/${currentUserDisplayName}/${userDisplayName}`);
  const user = await usersResponse.json();
  return user;
}

export const sendFriendsRequest = async (data) => {
  const currentUserDisplayName = data.currentUserDisplayName;
  const userFriendCode = data.userFriendCode;

  const response = await fetch(`${mongodbApiUrl}/auth/users/send-friends-request/`, {
    method: "POST",
    body: JSON.stringify({
      currentUserDisplayName: currentUserDisplayName,
      userFriendCode: userFriendCode
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
}

export const acceptFriendsRequest = async (data) => {
  const currentUserDisplayName = data.currentUserDisplayName;
  const userDisplayName = data.userDisplayName;

  const response = await fetch(`${mongodbApiUrl}/auth/users/accept-friends-request/`, {
    method: "POST",
    body: JSON.stringify({
      currentUserDisplayName: currentUserDisplayName,
      userDisplayName: userDisplayName
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
}

export const declineFriendsRequest = async (data) => {
  const currentUserDisplayName = data.currentUserDisplayName;
  const userDisplayName = data.userDisplayName;

  const response = await fetch(`${mongodbApiUrl}/auth/users/decline-friends-request/`, {
    method: "POST",
    body: JSON.stringify({
      currentUserDisplayName: currentUserDisplayName,
      userDisplayName: userDisplayName
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
}

export const removeFriend = async (data) => {
  const currentUserDisplayName = data.currentUserDisplayName;
  const userDisplayName = data.userDisplayName;

  const response = await fetch(`${mongodbApiUrl}/auth/users/remove-friend/`, {
    method: "POST",
    body: JSON.stringify({
      currentUserDisplayName: currentUserDisplayName,
      userDisplayName: userDisplayName
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

// Statistics

// Darts

export const getStatisticsDartsGames = async () => {
  const response = await fetch(`${mongodbApiUrl}/darts/statistics/dartsGames`);
  return await response.json()
}

export const getStatisticsOverAllPoints = async () => {
  const response = await fetch(`${mongodbApiUrl}/darts/statistics/overAllPoints`);
  return await response.json()
}

export const getStatisticsDoorHits = async () => {
  const response = await fetch(`${mongodbApiUrl}/darts/statistics/doorHits`);
  return await response.json()
}

export const getStatisticsTop3Players = async () => {
  const response = await fetch(`${mongodbApiUrl}/darts/statistics/top3players`);
  return await response.json()
}

export const getStatisticsTop3DoorHitters = async () => {
  const response = await fetch(`${mongodbApiUrl}/darts/statistics/top3doorhitters`);
  return await response.json()
}

// Get gamesPlayed for portfolio
export const getGamesPlayedPortfolio = async () => {
  const userResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers/portfolio/kubek`);
  const res = await userResponse.json();
  return res.gamesPlayed;
}