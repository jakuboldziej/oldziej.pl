const User = require('../models/user');

// Handling Online Users

let onlineUsers = [];
let disconnectTimeouts = {};

const changeDbUserOnlineStatus = async (userId, isOnline) => {
  await User.findByIdAndUpdate(
    userId,
    { online: isOnline },
    { new: true }
  );
}

const addingOnlineUser = (data, socketId, io) => {
  const emit = JSON.parse(data);

  const existingUser = onlineUsers.find((user) => user._id === emit.user._id);

  if (!existingUser) {
    onlineUsers.push({ ...emit.user, socketId });
    changeDbUserOnlineStatus(emit.user._id, true);

    io.emit('onlineUsersListener', JSON.stringify({
      updatedOnlineUsers: onlineUsers,
      updatedUser: {
        _id: emit.user._id,
        displayName: emit.user.displayName
      },
      isUserOnline: true
    }));
  } else {
    existingUser.socketId = socketId;
  }

  // Clearing the Timeout
  if (disconnectTimeouts[emit.user._id]) {
    clearTimeout(disconnectTimeouts[emit.user._id]);
    delete disconnectTimeouts[emit.user._id];
  }
}

const scheduleUserOffline = (socketId, io) => {
  const delay = 30000;

  const user = onlineUsers.find((user) => user.socketId === socketId);

  if (user) {
    disconnectTimeouts[user._id] = setTimeout(() => {
      const onlineUsersData = removeUserOnDisconnect(user._id);

      io.emit('onlineUsersListener', JSON.stringify({
        updatedOnlineUsers: onlineUsersData.onlineUsers,
        updatedUser: onlineUsersData.updatedUser,
        isUserOnline: false
      }));
    }, delay);
  }
}

const removeUserOnDisconnect = (userId) => {
  const user = onlineUsers.find((user) => user._id === userId);

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
  changeDbUserOnlineStatus,
  addingOnlineUser,
  removeUserOnDisconnect,
  scheduleUserOffline,
}