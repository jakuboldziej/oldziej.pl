const User = require('../models/user');

const changeDbUserOnlineStatus = async (userId, isOnline) => {
  await User.findByIdAndUpdate(
    userId,
    { online: isOnline },
    { new: true }
  );
}

module.exports = {
  changeDbUserOnlineStatus,
}