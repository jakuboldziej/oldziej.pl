const express = require("express");
const router = express.Router();
const User = require('../models/user');
const DartsUser = require('../models/darts/dartsUser');
const FtpUser = require('../models/ftpUser');
const ChoresUser = require('../models/chores/choresUser');
const DoorUser = require('../models/esp32/door/doorUser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const authenticateUser = require("../middleware/auth");
const { requireAdmin, isSelfOrAdmin } = require("../middleware/authorize");
const { notifyAdminSafely, sendVerificationEmailSafely } = require("../services/emailService");
const { io } = require("../server");
const { emitToUsers } = require("../socket.io/rooms");
const { createRateLimiter } = require("../middleware/rateLimiters");
const { logger } = require("../middleware/logging");

require('dotenv').config();

const loginLimiter = createRateLimiter(10, 15 * 60 * 1000, "Too many login attempts. Try again later.");
const registerLimiter = createRateLimiter(3, 30 * 60 * 1000, "Too many registration attempts. Try again later.");
const changePasswordLimiter = createRateLimiter(3, 30 * 60 * 1000, "Too many change password attempts. Try again later.");
const checkEmailLimiter = createRateLimiter(20, 15 * 60 * 1000, "Too many lookups. Try again later.");

// Users

router.get('/users', authenticateUser, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 })
    res.json(users)
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get('/users/:identifier', authenticateUser, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    if (Types.ObjectId.isValid(identifier)) {
      const user = await User.findOne({ _id: identifier }, { password: 0 });
      res.json(user);
    } else {
      const user = await User.findOne({ displayName: identifier }, { password: 0 });
      res.json(user);
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get('/users/check-existing-name/:displayName', checkEmailLimiter, async (req, res) => {
  try {
    const exists = await User.exists({ displayName: req.params.displayName });
    res.json({ exists: !!exists })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

router.get('/users/check-existing-mail/:email', checkEmailLimiter, async (req, res) => {
  try {
    const exists = await User.exists({ email: req.params.email });
    res.json({ exists: !!exists })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

const USER_SELF_EDITABLE_FIELDS = ["displayName", "friendsCode"];
const USER_ADMIN_EDITABLE_FIELDS = [...USER_SELF_EDITABLE_FIELDS, "role", "verified", "email"];

router.patch("/users/:displayName", authenticateUser, async (req, res) => {
  try {
    const { displayName } = req.params;

    if (!isSelfOrAdmin(res.authUser, displayName)) {
      return res.status(403).json({ message: "You can only edit your own account." });
    }

    const allowedFields = res.authUser.role === "admin"
      ? USER_ADMIN_EDITABLE_FIELDS
      : USER_SELF_EDITABLE_FIELDS;

    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided." });
    }

    const user = await User.findOne({ displayName });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, projection: { password: 0 } }
    );

    logger.info("PATCH User", { method: req.method, url: req.url, data: { displayName, updated: Object.keys(updates) } });
    res.json(updatedUser);
  } catch (err) {
    logger.error("PATCH User", { method: req.method, url: req.url, error: err.message });
    return res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:displayName', authenticateUser, async (req, res) => {
  try {
    const displayName = req.params.displayName;

    if (!isSelfOrAdmin(res.authUser, displayName)) {
      return res.status(403).json({ message: "You can only delete your own account." });
    }

    // Delete user from all related collections
    await Promise.all([
      User.deleteOne({ displayName }),
      DartsUser.deleteOne({ displayName }),
      FtpUser.deleteOne({ displayName }),
      ChoresUser.deleteOne({ displayName }),
      DoorUser.deleteOne({ displayName })
    ]);

    logger.info("DELETE User - Cascade delete completed", {
      method: req.method,
      url: req.url,
      displayName
    });

    notifyAdminSafely(
      `[Admin] - User Deleted Account: ${displayName}`,
      `User deleted his account: ${displayName}`
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error("DELETE User - Failed", { method: req.method, url: req.url, error: err.message });
    res.status(400).json({ message: err.message });
  }
});

// Friends

router.get('/users/friends-page-data/:displayName', authenticateUser, async (req, res) => {
  try {
    const currentUser = await User.findOne(
      { displayName: req.params.displayName },
      { password: 0 }
    );

    if (!currentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    const friends = await User.find(
      { displayName: { $in: currentUser.friends } },
      { _id: 1, displayName: 1, friends: 1, friendsCode: 1, online: 1 }
    );

    const pendingUsers = await User.find(
      { _id: { $in: currentUser.friendsRequests.pending } },
      { _id: 1, displayName: 1 }
    );

    const receivedUsers = await User.find(
      { _id: { $in: currentUser.friendsRequests.received } },
      { _id: 1, displayName: 1 }
    );

    res.json({
      friendsCode: currentUser.friendsCode,
      friends: friends.map(f => ({
        _id: f._id,
        displayName: f.displayName,
        friends: f.friends,
        friendsCode: f.friendsCode,
        online: f.online
      })),
      friendsRequests: {
        pending: pendingUsers.map(u => ({ _id: u._id, displayName: u.displayName })),
        received: receivedUsers.map(u => ({ _id: u._id, displayName: u.displayName }))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users/check-if-friends/:currentUserDisplayName/:userDisplayName', authenticateUser, async (req, res) => {
  try {
    const currentUser = await User.findOne({ displayName: req.params.currentUserDisplayName }, { password: 0 });
    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendDisplayName) => friendDisplayName === userDisplayName);

    if (isUserFriendsWithCurrentUser) res.json(true)
    else res.json(false)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.post('/users/send-friends-request/', authenticateUser, async (req, res) => {
  try {
    const userFriendCode = req.body.userFriendCode;

    let currentUser = await User.findOne({ displayName: res.authUser.displayName }, { password: 0 });
    let user = await User.findOne({ friendsCode: userFriendCode }, { password: 0 });
    if (!user) return res.json({
      message: `Friend code is not valid (${userFriendCode}).`
    });
    if (!currentUser) return res.status(404).json({ message: "User not found." });
    const userId = user._id.toString()
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendDisplayName) => friendDisplayName === user.displayName);
    const isCurrentUserAlreadyPending = currentUser.friendsRequests.pending.find((friendId) => friendId === userId);
    const isUserAlreadyPending = user.friendsRequests.pending.find((friendId) => friendId === currentUserId);
    const isCurrentUserSendingToHimself = currentUser.friendsCode === userFriendCode ? true : false;

    if (isUserFriendsWithCurrentUser) return res.json({
      message: `You are already friends with ${user.displayName}.`
    });
    else if (isCurrentUserAlreadyPending) return res.json({
      message: `You already sent friend request to ${user.displayName}.`
    });
    else if (isUserAlreadyPending) return res.json({
      message: `${user.displayName} already sent you a friend request.`
    });
    else if (isCurrentUserSendingToHimself) return res.json({
      message: `You can't send friend request to yourself!`
    });
    else {
      currentUser.friendsRequests.pending.push(userId);
      user.friendsRequests.received.push(currentUserId);

      await User.findByIdAndUpdate(
        currentUser._id,
        currentUser,
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        user,
        { new: true }
      );

      emitToUsers(io, [currentUserId, userId], "sendFriendsRequest", JSON.stringify({
        friendsRequestsReceived: user.friendsRequests.received.length,
        currentUserDisplayName: currentUser.displayName,
        userDisplayName: user.displayName,
      }));


      return res.json({
        message: `Friend request sent to ${user.displayName}.`,
        sentToUserDisplayName: user.displayName
      })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.post('/users/accept-friends-request/', authenticateUser, async (req, res) => {
  try {
    let currentUser = await User.findOne({ displayName: res.authUser.displayName }, { password: 0 });
    let user = await User.findOne({ displayName: req.body.userDisplayName }, { password: 0 });
    if (!currentUser || !user) return res.status(404).json({ message: "User not found." });
    const userId = user._id.toString();
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendDisplayName) => friendDisplayName === user.displayName);

    if (isUserFriendsWithCurrentUser) return res.json({
      message: `You are already friends with ${user.displayName}.`
    });
    else {
      currentUser.friendsRequests.received = currentUser.friendsRequests.received.filter((id) => id !== userId);
      user.friendsRequests.pending = user.friendsRequests.pending.filter((id) => id !== currentUserId);

      currentUser.friends.push(user.displayName);
      user.friends.push(currentUser.displayName);

      await User.findByIdAndUpdate(
        currentUser._id,
        currentUser,
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        user,
        { new: true }
      );

      emitToUsers(io, [currentUserId, userId], "acceptFriendsRequest", JSON.stringify({
        accepted: true,
        sentFrom: user.displayName,
        sentTo: currentUser.displayName,
      }));

      emitToUsers(io, [currentUserId], "updateCounters", JSON.stringify({
        currentUserDisplayName: currentUser.displayName,
        friendsRequestsReceived: currentUser.friendsRequests.received.length
      }));

      res.json({
        message: `${currentUser.displayName} accepted ${user.displayName}'s friends request.`,
        newCurrentUserFriend: userId
      })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.post('/users/decline-friends-request/', authenticateUser, async (req, res) => {
  try {
    let currentUser = await User.findOne({ displayName: res.authUser.displayName }, { password: 0 });
    let user = await User.findOne({ displayName: req.body.userDisplayName }, { password: 0 });
    if (!currentUser || !user) return res.status(404).json({ message: "User not found." });
    const userId = user._id.toString();
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendDisplayName) => friendDisplayName === user.displayName);

    if (isUserFriendsWithCurrentUser) return res.json({
      message: `You are already friends with ${user.displayName}.`
    });
    else {
      currentUser.friendsRequests.received = currentUser.friendsRequests.received.filter((id) => id !== userId);
      user.friendsRequests.pending = user.friendsRequests.pending.filter((id) => id !== currentUserId);

      await User.findByIdAndUpdate(
        currentUser._id,
        currentUser,
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        user,
        { new: true }
      );

      emitToUsers(io, [currentUserId, userId], "declineFriendsRequest", JSON.stringify({
        declined: true,
        sentFrom: user.displayName,
        sentTo: currentUser.displayName,
      }));

      emitToUsers(io, [currentUserId], "updateCounters", JSON.stringify({
        currentUserDisplayName: currentUser.displayName,
        friendsRequestsReceived: currentUser.friendsRequests.received.length
      }));

      emitToUsers(io, [userId], "updateCounters", JSON.stringify({
        currentUserDisplayName: user.displayName,
        friendsRequestsPending: user.friendsRequests.pending.length
      }));

      res.json({
        message: `${currentUser.displayName} declined ${user.displayName}'s friends request.`,
        newCurrentUserFriend: userId
      })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.post('/users/cancel-friends-request/', authenticateUser, async (req, res) => {
  try {
    let currentUser = await User.findOne({ displayName: res.authUser.displayName }, { password: 0 });
    let user = await User.findOne({ displayName: req.body.userDisplayName }, { password: 0 });
    if (!currentUser || !user) return res.status(404).json({ message: "User not found." });
    const userId = user._id.toString();
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendDisplayName) => friendDisplayName === user.displayName);
    const isCurrentUserPendingToUser = currentUser.friendsRequests.pending.find((friendId) => friendId === userId);

    if (isUserFriendsWithCurrentUser) return res.json({
      message: `You are already friends with ${user.displayName}.`
    });
    else if (!isCurrentUserPendingToUser) return res.json({
      message: `You don't have a pending friend request to ${user.displayName}.`
    });
    else {
      currentUser.friendsRequests.pending = currentUser.friendsRequests.pending.filter((id) => id !== userId);
      user.friendsRequests.received = user.friendsRequests.received.filter((id) => id !== currentUserId);

      await User.findByIdAndUpdate(
        currentUser._id,
        currentUser,
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        user,
        { new: true }
      );

      // Notify the user who received the request that it was canceled
      emitToUsers(io, [currentUserId, userId], "cancelFriendsRequest", JSON.stringify({
        canceled: true,
        sentFrom: currentUser.displayName,
        sentTo: user.displayName,
      }));

      // Update counters for both users
      emitToUsers(io, [currentUserId], "updateCounters", JSON.stringify({
        currentUserDisplayName: currentUser.displayName,
        friendsRequestsPending: currentUser.friendsRequests.pending.length
      }));

      emitToUsers(io, [userId], "updateCounters", JSON.stringify({
        currentUserDisplayName: user.displayName,
        friendsRequestsReceived: user.friendsRequests.received.length
      }));

      res.json({
        message: `${currentUser.displayName} canceled friend request to ${user.displayName}.`,
        canceledRequestTo: userId
      })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.post('/users/remove-friend/', authenticateUser, async (req, res) => {
  try {
    let currentUser = await User.findOne({ displayName: res.authUser.displayName }, { password: 0 });
    let user = await User.findOne({ displayName: req.body.userDisplayName }, { password: 0 });
    if (!currentUser || !user) return res.status(404).json({ message: "User not found." });
    const userId = user._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendDisplayName) => friendDisplayName === user.displayName);

    if (!isUserFriendsWithCurrentUser) {
      return res.json({
        message: `${currentUser.displayName} is not friends with ${user.displayName}.`
      });
    }
    else {
      currentUser.friends = currentUser.friends.filter((friendDisplayName) => friendDisplayName !== user.displayName);
      user.friends = user.friends.filter((friendDisplayName) => friendDisplayName !== currentUser.displayName);


      await User.findByIdAndUpdate(
        currentUser._id,
        currentUser,
        { new: true }
      );
      await User.findByIdAndUpdate(
        user._id,
        user,
        { new: true }
      );

      emitToUsers(io, [currentUser._id.toString(), userId], "removeFriend", JSON.stringify({
        removed: true,
        removedBy: currentUser.displayName,
        removedUser: user.displayName,
      }));

      res.json({
        message: `${currentUser.displayName} removed ${user.displayName} as a friend.`,
        removedFriend: userId
      });
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

// Auth

router.post("/register", registerLimiter, (req, res) => {
  const displayName = req.body.displayName?.trim();
  const email = req.body.email?.trim();

  if (!displayName || displayName !== req.body.displayName) {
    logger.error("Register User - Invalid displayName", { method: req.method, url: req.url });
    return res.status(400).send({
      message: "DisplayName cannot have leading or trailing spaces"
    });
  }

  bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
    const user = new User({
      email: email,
      displayName: displayName,
      password: hashedPassword,
      friendsCode: req.body.friendsCode
    });

    user.save().then((result) => {
      const token = jwt.sign(
        {
          userId: result._id,
          userEmail: result.email,
          displayName: result.displayName
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      sendVerificationEmailSafely(result);
      notifyAdminSafely(
        `[Admin] - New User Registered: ${result.displayName}`,
        `New user is registered: ${result.displayName}`
      );

      logger.info("Register User", {
        method: req.method,
        url: req.url,
        data: { _id: result._id, displayName: result.displayName }
      });
      res.status(201).send({
        message: "User Created Successfully",
        verified: user.verified,
        friendsRequestsReceived: user.friendsRequests.received.length,
        token,
        _id: user._id
      });
    }).catch((error) => {
      logger.error("Register User", { method: req.method, url: req.url, error: error.message });
      res.status(500).send({
        message: "Error creating user",
        error,
      });
    });
  }).catch((error) => {
    logger.error("Register User", { method: req.method, url: req.url, error: error.message });
    res.status(500).send({
      message: "Password was not hashed successfully",
      error,
    });
  });
});

router.post("/login", loginLimiter, (req, res) => {
  const displayName = req.body.displayName?.trim();

  User.findOne({ displayName }).then((user) => {
    if (!user) {
      logger.error("Login User - Not Found", { method: req.method, url: req.url });
      return res.status(401).send({
        message: "User not found",
      });
    }

    bcrypt.compare(req.body.password, user.password).then((passwordCheck) => {
      if (!passwordCheck) {
        return res.status(401).send({
          message: "Wrong password",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          userEmail: user.email,
          displayName: user.displayName
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      const sanitizedUserForLogs = {
        _id: user._id,
        displayName: user.displayName,
        role: user.role,
        verified: user.verified
      };

      logger.info("Login User", { method: req.method, url: req.url, data: sanitizedUserForLogs });
      res.status(200).send({
        message: "Login Successful",
        token,
        userId: user._id,
        verified: user.verified,
        role: user.role,
        friendsRequestsReceived: user.friendsRequests?.received?.length || 0,
      });
    }).catch((error) => {
      logger.error("Login User - Bcrypt Error", { method: req.method, url: req.url, error: error.message });
      res.status(500).send({
        message: "An error occurred while processing your request.",
      });
    });
  }).catch((error) => {
    logger.error("Login User - DB Error", { method: req.method, url: req.url, error: error.message });
    res.status(500).send({
      message: "Database error occurred",
    });
  });
});

router.patch("/change-password", changePasswordLimiter, authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ displayName: req.body.displayName });
    if (!user) return res.status(401).send({ message: "User not found." });

    const passwordMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!passwordMatch) {
      return res.send({ error: "Incorrect current password." });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    logger.info("ChangePassword User", { method: req.method, url: req.url, data: req.body.displayName });
    res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    logger.error("ChangePassword User", { method: req.method, url: req.url, error: error.message });
    res.status(500).send({ error: "Error changing password" });
  }
});

const REFRESH_GRACE_SECONDS = 30 * 24 * 60 * 60;

router.post("/refresh-token", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Not authorized." });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).send({ message: "Invalid token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    if (!decoded || !decoded.userId) {
      return res.status(403).send({ message: "Invalid token" });
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && nowInSeconds - decoded.exp > REFRESH_GRACE_SECONDS) {
      return res.status(401).send({ message: "Session expired" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }

    const newToken = jwt.sign(
      {
        userId: user._id,
        userEmail: user.email,
        displayName: user.displayName
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    logger.info("Token Refreshed", { method: req.method, url: req.url, userId: user._id });
    res.status(200).send({
      message: "Token refreshed successfully",
      token: newToken,
      verified: user.verified,
      role: user.role,
      friendsRequestsReceived: user.friendsRequests.received.length,
    });
  } catch (err) {
    logger.error("Token Refresh Failed", { method: req.method, url: req.url, error: err.message });
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({ message: "Invalid token" });
    }
    res.status(500).send({ message: "Token refresh failed" });
  }
});

router.post("/check-session", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Not authorized." });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).send({ message: "Invalid token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    const shouldRefresh = expiresIn < 7 * 24 * 60 * 60;

    res.json({
      ok: true,
      shouldRefresh,
      expiresIn
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).send({ message: "Token expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({ message: "Invalid token" });
    }
    res.status(403).send({ message: "User not authenticated." });
  }
});

module.exports = router