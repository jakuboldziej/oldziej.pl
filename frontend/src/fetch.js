export const mongodbApiUrl = import.meta.env.VITE_MONGODB_API_LOCAL;

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

// Users
export const postFtpUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/ftp/users`, {
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

export const getFtpUser = async (uDisplayName) => {
  const userResponse = await fetch(`${mongodbApiUrl}/ftp/users/${uDisplayName}`);
  const user = await userResponse.json();
  return user[0];
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

export const getFile = async (filename) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${filename}`);
  const data = await response.json();
  return data.file;
}

export const uploadFile = async (data) => {
  const uploadResponse = await fetch(`${mongodbApiUrl}/ftp/upload?userDisplayName=${data.get("userDisplayName")}`, {
    method: "POST",
    body: data,
  });
  const uploadFile = await uploadResponse.json();

  const mainFolder = await getFolders(data.get("userDisplayName"), "Dysk w chmurze");

  const ftpFile = await fetch(`${mongodbApiUrl}/ftp/files`, {
    method: "POST",
    body: JSON.stringify({
      fileId: uploadFile.file.id,
      owner: uploadFile.file.metadata.owner,
      favorite: false,
      lastModified: data.get("lastModified"),
      folders: [mainFolder.folders[0]._id]
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await ftpFile.json();
}

export const deleteFile = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${id}`, {
    method: "DELETE"
  })
  return await response.json();
}

export const updateFile = async (data) => {
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
  const file = await response.json();
  return file.file;
}

// Folders
export const postFolder = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders`, {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      owner: data.owner
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
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
  return data;
}

// Users
export const loginUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      displayName: userData.displayName,
      password: userData.password
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
}

export const registerUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/auth/register`, {
    method: "POST",
    body: JSON.stringify({
      email: userData.email,
      displayName: userData.displayName,
      password: userData.password
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  return await response.json();
}