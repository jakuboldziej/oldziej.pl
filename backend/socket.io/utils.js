const User = require('../models/user');
const { logger } = require('../middleware/logging');

// Handling Online Users

let onlineUsers = [];
let disconnectTimeouts = {};

const changeDbUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(
      userId,
      { online: isOnline },
      { new: true }
    );
  } catch (error) {
    logger.error('Failed to update online status', { userId, error: error.message });
  }
}

const addingOnlineUser = (emit, socketId, io) => {
  if (!emit?.user?._id) return;

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

    io.to(socketId).emit('onlineUsersListener', JSON.stringify({
      updatedOnlineUsers: onlineUsers,
      updatedUser: {
        _id: emit.user._id,
        displayName: emit.user.displayName
      },
      isUserOnline: true
    }));
  }

  if (disconnectTimeouts[emit.user._id]) {
    clearTimeout(disconnectTimeouts[emit.user._id]);
    delete disconnectTimeouts[emit.user._id];
  }
}

const scheduleUserOffline = (socketId, io, delay = 15000 /* 15 seconds */) => {
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