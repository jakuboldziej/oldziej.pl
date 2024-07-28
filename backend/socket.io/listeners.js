const { changeDbUserOnlineStatus } = require('./utils');

// Handling Online Users

let onlineUsers = [];

const addingOnlineUser = (data) => {
  const emit = JSON.parse(data);

  const isUserOnline = onlineUsers.find((user) => user._id === emit.user._id)

  if (!isUserOnline) {
    onlineUsers.push(emit.user);
    changeDbUserOnlineStatus(emit.user._id, true);

    return { onlineUsers, updatedUser: { _id: emit.user._id, displayName: emit.user.displayName } };
  }
  return { onlineUsers, updatedUser: null };
}

const removeUserOnDisconnect = (socketId) => {
  const user = onlineUsers.find((user) => user.socketId === socketId);

  if (user) {
    const index = onlineUsers.indexOf(user);
    onlineUsers.splice(index, 1);
    changeDbUserOnlineStatus(user._id, false);

    return { onlineUsers, updatedUser: { _id: user._id, displayName: user.displayName } };
  } else {
    return { onlineUsers, updatedUser: null };
  }
}

module.exports = {
  addingOnlineUser,
  removeUserOnDisconnect,
};