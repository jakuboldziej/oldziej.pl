const userRoom = (userId) => `user-${userId}`;

const gameRoom = (gameCode) => `game-${gameCode}`;

const emitToUsers = (io, userIds, event, payload) => {
  const rooms = [...new Set(userIds.filter(Boolean).map((id) => userRoom(id.toString())))];
  if (rooms.length === 0) return;
  io.to(rooms).emit(event, payload);
};

module.exports = { userRoom, gameRoom, emitToUsers };
