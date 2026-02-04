import { calcStorageUsage } from "@/components/Home/Cloud/utils";
import Cookies from "js-cookie";

export const mongodbApiUrl = import.meta.env.MODE === "development" ? "/api" : import.meta.env.VITE_BACKEND_DOMAIN + "/api";

// Darts

// Darts - Games

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
      training: gameData.training || false,
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const patchDartsGame = async (gameData) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsGames/${gameData._id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...gameData
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const deleteDartsGame = async (gameId) => {
  await fetch(`${mongodbApiUrl}/darts/dartsGames/${gameId}`, {
    method: "DELETE",
    headers: {
      "Authorization": Cookies.get("_auth")
    }
  });
}

export const getDartsGames = async (userDisplayName = null, limit = 0, trainingFilter = 'competitive', excludeRecord = true) => {
  let url = `${mongodbApiUrl}/darts/dartsGames`;

  const queryParams = [];
  if (limit) {
    queryParams.push(`limit=${limit}`);
  }
  if (userDisplayName) {
    queryParams.push(`user=${userDisplayName}`);
  }
  if (trainingFilter) {
    queryParams.push(`trainingFilter=${trainingFilter}`);
  }
  if (excludeRecord) {
    queryParams.push(`excludeRecord=true`);
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const gamesResponse = await fetch(url, {
    headers: {
      "Authorization": Cookies.get("_auth")
    }
  }
  );

  return await gamesResponse.json();
}

export const getDartsGame = async (identifier) => {
  const gameResponse = await fetch(`${mongodbApiUrl}/darts/dartsGames/${identifier}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    }
  });

  return await gameResponse.json();
}

export const getDartsPageData = async (userDisplayName, friendsDisplayNames = []) => {
  const friendsParam = friendsDisplayNames.length > 0 ? `?friends=${friendsDisplayNames.join(',')}` : '';

  const response = await fetch(`${mongodbApiUrl}/darts/dartsPage/${userDisplayName}${friendsParam}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    }
  });

  return await response.json();
}

// Darts - Users

export const getDartsUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    }
  });
  const users = await usersResponse.json();
  return users;
}

export const getDartsUser = async (identifier) => {
  const userResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${identifier}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    }
  });
  const user = await userResponse.json();
  return user;
}

export const patchDartsUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${userData.displayName}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const deleteDartsUser = async (displayName) => {
  const response = await fetch(`${mongodbApiUrl}/darts/dartsUsers/${encodeURIComponent(displayName.trim())}`, {
    method: "DELETE",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
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
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

// Darts - Utils

export const joinDartsGame = async (gameCode) => {
  const gameResponse = await fetch(`${mongodbApiUrl}/darts/game/join/${gameCode}`, {
    method: "POST"
  });

  return await gameResponse.json();
}

// Cloud

// Cloud - Users

export const getFtpUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/ftp/users`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });
  const users = await usersResponse.json();
  return users;
}

export const getFtpUser = async (identifier) => {
  const userResponse = await fetch(`${mongodbApiUrl}/ftp/users/${encodeURIComponent(identifier.trim())}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });
  const user = await userResponse.json();
  return user;
}

export const postFtpUser = async (userData) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/users`, {
    method: "POST",
    body: JSON.stringify({
      displayName: userData.displayName,
      email: userData.email,
      main_folder: userData.main_folder
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const deleteFtpUser = async (displayName) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/users/${encodeURIComponent(displayName.trim())}`, {
    method: "DELETE",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  })
  return await response.json();
}

export const patchFtpUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/ftp/users/${userData.displayName}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
}

// Cloud - Files

export const getFiles = async (userId = null) => {
  let url = `${mongodbApiUrl}/ftp/files`;

  const queryParams = [];
  if (userId) {
    queryParams.push(`userId=${userId}`)
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await fetch(url, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const getFile = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${id}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const uploadFile = async (data) => {
  const uploadResponse = await fetch(`${mongodbApiUrl}/ftp/upload?userId=${data.get("userId")}`, {
    method: "POST",
    body: data,
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });
  const uploadedFile = await uploadResponse.json();

  const ftpFileRes = await fetch(`${mongodbApiUrl}/ftp/files`, {
    method: "POST",
    body: JSON.stringify({
      fileId: uploadedFile.file.id,
      ownerId: uploadedFile.file.metadata.ownerId,
      favorite: false,
      lastModified: data.get("lastModified"),
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await ftpFileRes.json();
}

export const deleteFile = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

export const patchFile = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/files/${data.file._id}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: data,
      newFileName: data?.newFileName || null
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  })

  return await response.json();
}

// Cloud - Folders

export const postFolder = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders`, {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      ownerId: data.ownerId,
      uploadDate: data.uploadDate
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  })

  return await response.json();
}

export const getFolders = async (userId = null, folderName = null) => {
  let url = `${mongodbApiUrl}/ftp/folders`;

  const queryParams = [];
  if (userId) {
    queryParams.push(`userId=${userId}`)
  }
  if (folderName) {
    queryParams.push(`folderName=${folderName}`)
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const response = await fetch(url, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const getFolder = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders/${id}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const deleteFolder = async (id) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  })
  return await response.json();
}

export const patchFolder = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/folders/${data.folder._id}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: data,
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  })
  return await response.json();
}

// Cloud - Utils

export const renderFile = async (filename) => {
  window.open(`${mongodbApiUrl}/ftp/files/render/${filename}?token=${Cookies.get("_auth")}`);
};

export const downloadFile = (filename) => {
  window.location.href = `${mongodbApiUrl}/ftp/files/download/${filename}?token=${Cookies.get("_auth")}`;
}

// Auth

// Auth - Users

export const getAuthUsers = async () => {
  const usersResponse = await fetch(`${mongodbApiUrl}/auth/users`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });
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

export const patchAuthUser = async (userData) => {
  await fetch(`${mongodbApiUrl}/auth/users/${userData.displayName}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...userData
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
}

export const deleteAuthUser = async (displayName) => {
  const response = await fetch(`${mongodbApiUrl}/auth/users/${encodeURIComponent(displayName.trim())}`, {
    method: "DELETE",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  })
  return await response.json();
}

export const handleDeleteAuthUser = async (selectedUser) => {
  const ftpUser = await getFtpUser(selectedUser.displayName);

  if (ftpUser) {
    await deleteFolder(ftpUser.main_folder);
    await deleteFtpUser(selectedUser.displayName);
  }

  await deleteDartsUser(selectedUser.displayName);

  const authUsers = await getAuthUsers();

  // Remove deleted user from friends
  const friendRemovalPromises = authUsers.map(async (user) => {
    if (user.displayName !== selectedUser.displayName) {
      if (user.friends.includes(selectedUser.displayName)) {
        await removeFriend({
          currentUserDisplayName: user.displayName,
          userDisplayName: selectedUser.displayName
        });
      }
    }
  });

  // Wait for all friend removal promises to complete
  await Promise.all(friendRemovalPromises);

  await deleteAuthUser(selectedUser.displayName);
}

export const changeDisplaynameUser = async (userData) => {
  try {
    await fetch(`${mongodbApiUrl}/auth/users/${userData.oldDisplayName}`, {
      method: "PATCH",
      body: JSON.stringify({
        displayName: userData.newDisplayName,
        friendsCode: userData.friendsCode
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": Cookies.get("_auth")
      },
    });

    await fetch(`${mongodbApiUrl}/ftp/users/${userData.oldDisplayName}`, {
      method: "PATCH",
      body: JSON.stringify({
        displayName: userData.newDisplayName
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": Cookies.get("_auth")
      },
    });

    await fetch(`${mongodbApiUrl}/darts/dartsUsers/${userData.oldDisplayName}`, {
      method: "PATCH",
      body: JSON.stringify({
        displayName: userData.newDisplayName
      }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": Cookies.get("_auth")
      },
    });
  } catch (e) {
    console.error(e);
    return { error: e };
  } finally {
    return true;
  }
}

// Auth - Password

export const changePassword = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/auth/change-password`, {
    method: "PATCH",
    body: JSON.stringify({
      displayName: data.displayName,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

// Friends

export const checkIfCurrentUserIsFriendsWithUser = async (currentUserDisplayName, userDisplayName) => {
  const usersResponse = await fetch(`${mongodbApiUrl}/auth/users/check-if-friends/${currentUserDisplayName}/${userDisplayName}`, {
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });
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
      "Authorization": Cookies.get("_auth")
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
      "Authorization": Cookies.get("_auth")
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
      "Authorization": Cookies.get("_auth")
    },
  })

  return await response.json();
}

export const cancelFriendsRequest = async (data) => {
  const currentUserDisplayName = data.currentUserDisplayName;
  const userDisplayName = data.userDisplayName;

  const response = await fetch(`${mongodbApiUrl}/auth/users/cancel-friends-request/`, {
    method: "POST",
    body: JSON.stringify({
      currentUserDisplayName: currentUserDisplayName,
      userDisplayName: userDisplayName
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
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
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

// Authentication

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

export const checkSession = async () => {
  const response = await fetch(`${mongodbApiUrl}/auth/check-session`, {
    method: "POST",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const refreshToken = async () => {
  const response = await fetch(`${mongodbApiUrl}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

// Emails

export const sendVerificationEmail = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/emails/send-verify-email`, {
    method: "POST",
    body: JSON.stringify({
      userEmail: data.userEmail
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

export const sendChangeEmail = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/emails/send-change-email`, {
    method: "PATCH",
    body: JSON.stringify({
      userEmail: data.userEmail,
      newUserEmail: data.newUserEmail
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const newUserRegisteredEmail = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/emails/new-user-registered`, {
    method: "POST",
    body: JSON.stringify({
      newUserDisplayName: data.newUserDisplayName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

export const userDeletedAccountEmail = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/emails/user-deleted-account`, {
    method: "POST",
    body: JSON.stringify({
      deletedUserDisplayName: data.deletedUserDisplayName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}

// ESP32

// WLED

export const getESP32State = async () => {
  const response = await fetch(`${mongodbApiUrl}/esp32/json-state`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

export const getESP32Info = async () => {
  const response = await fetch(`${mongodbApiUrl}/esp32/json-info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

export const getESP32Effects = async () => {
  const response = await fetch(`${mongodbApiUrl}/esp32/json-effects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

export const getESP32Palettes = async () => {
  const response = await fetch(`${mongodbApiUrl}/esp32/json-palettes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

export const patchESP32State = async (data) => {
  const response = await fetch(`${mongodbApiUrl}/esp32/change-state`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

// ESP32 - Darts game

export const getESP32Availability = async (gameCode) => {
  const response = await fetch(`${mongodbApiUrl}/esp32/check-availability/${gameCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });
  return await response.json();
}

export const postESP32JoinGame = async (gameCode) => {
  const response = await fetch(`${mongodbApiUrl}/esp32/join-game/${gameCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const postESP32LeaveGame = async (gameCode) => {
  const response = await fetch(`${mongodbApiUrl}/esp32/leave-game/${gameCode}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

export const postESP32ForceReset = async () => {
  const response = await fetch(`${mongodbApiUrl}/esp32/force-reset-wled`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": Cookies.get("_auth")
    },
  });

  return await response.json();
}

// Doors

export const checkIfValidationNeeded = async () => {
  try {
    const response = await fetch(`${mongodbApiUrl}/esp32/door/check-if-validation-needed`);

    return await response.json();
  } catch (error) {
    console.error("Error in checkIfValidationNeeded:", error);
    throw error;
  }
}

export const getValidationConfig = async () => {
  try {
    const response = await fetch(`${mongodbApiUrl}/esp32/door/validation-config`, {
      method: "GET",
      headers: {
        "Authorization": Cookies.get("_auth")
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Error in getValidationConfig:", error);
    throw error;
  }
}

export const postValidationActive = async (active) => {
  try {
    const response = await fetch(`${mongodbApiUrl}/esp32/door/set-validation-active`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Cookies.get("_auth")
      },
      body: JSON.stringify({
        active
      })
    });

    return await response.json();
  } catch (error) {
    console.error("Error in postValidationActive:", error);
    throw error;
  }
}

export const patchValidationConfig = async (updatedConfig) => {
  try {
    const response = await fetch(`${mongodbApiUrl}/esp32/door/validation-config`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Cookies.get("_auth")
      },
      body: JSON.stringify({
        updatedConfig
      })
    });

    return await response.json();
  } catch (error) {
    console.error("Error in patchValidationConfig:", error);
    throw error;
  }
}

// Keypad

export const getKeypadStrokes = async () => {
  try {
    const response = await fetch(`${mongodbApiUrl}/esp32/door/keypad/get-keypad-strokes`, {
      method: "GET",
      headers: {
        "Authorization": Cookies.get("_auth")
      },
    });

    return await response.json();
  } catch (error) {
    console.error("Error in getKeypadStrokes:", error);
    throw error;
  }
}

export const postKeypadStroke = async (keyStroke) => {
  try {
    const encodedKeyStroke = encodeURIComponent(keyStroke);

    const response = await fetch(`${mongodbApiUrl}/esp32/door/keypad/send-keypad-stroke/${encodedKeyStroke}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": Cookies.get("_auth")
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send keypad stroke');
    }

    return await response.json();
  } catch (err) {
    console.error('Error sending keypad stroke:', err);
    throw err;
  }
}

// Statistics

// Statistics - Darts

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
  return await response.json();
}

// Statistics - Cloud

export const getFilesCreated = async () => {
  const response = await fetch(`${mongodbApiUrl}/ftp/statistics/filesCreated`);
  return await response.json();
}

export const getStatisticsUsersFilesCreated = async (userId) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/statistics/filesCreated/${userId}`);
  return await response.json();
}

export const getFoldersCreated = async () => {
  const response = await fetch(`${mongodbApiUrl}/ftp/statistics/foldersCreated`);
  return await response.json();
}

export const getStatisticsUsersFoldersCreated = async (userId) => {
  const response = await fetch(`${mongodbApiUrl}/ftp/statistics/foldersCreated/${userId}`);
  return await response.json();
}

export const getStatisticsStorageUsed = async () => {
  const response = await fetch(`${mongodbApiUrl}/ftp/statistics/storageUsed`);
  const responseInBytes = await response.json();

  return calcStorageUsage(null, responseInBytes).bytes;
}

// Get gamesPlayed for portfolio
export const getGamesPlayedPortfolio = async () => {
  const userResponse = await fetch(`${mongodbApiUrl}/darts/dartsUsers/portfolio/kubek`);

  const res = await userResponse.json();
  return res.gamesPlayed;
}