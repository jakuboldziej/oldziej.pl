const express = require("express")
const router = express.Router()
const User = require('../models/user')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");

const getAuthUser = async (req, res, next) => {
  let user;
  try {
    const { displayName } = req.params;
    user = await User.findOne({ displayName });
    if (user == null) return res.status(404);
  } catch (err) {
    return res.json({ message: err.message })
  }
  res.user = user;
  next();
}

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 })
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.get('/users/:identifier', async (req, res) => {
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

router.get('/users/check-existing-mail/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
    res.json(user)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.put("/users/:displayName", getAuthUser, async (req, res) => {
  const { displayName, ...updateData } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      res.user._id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    return res.json({ message: err.message });
  }
});

router.delete('/users/:displayName', async (req, res) => {
  try {
    await User.deleteOne({ displayName: req.params.displayName });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Friends

router.get('/users/check-if-friends/:currentUserDisplayName/:userDisplayName', async (req, res) => {
  try {
    const currentUser = await User.findOne({ displayName: req.params.currentUserDisplayName });
    const userId = (await User.findOne({ displayName: req.params.userDisplayName }))._id.toString();
    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendId) => friendId === userId);

    if (isUserFriendsWithCurrentUser) res.json(true)
    else res.json(false)
  } catch (err) {
    res.json({ message: err.message })
  }
});

router.post('/users/send-friends-request/', async (req, res) => {
  try {
    const io = req.app.locals.io;

    const userFriendCode = req.body.userFriendCode;

    let currentUser = await User.findOne({ displayName: req.body.currentUserDisplayName });
    let user = await User.findOne({ friendsCode: userFriendCode });
    if (!user) return res.json({
      message: `Friend code is not valid (${userFriendCode}).`
    });
    const userId = user._id.toString()
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendId) => friendId === userId);
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

      io.emit("countersListener", JSON.stringify({
        friendsRequestsReceived: user.friendsRequests.received.length,
        userDisplayName: user.displayName
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

router.post('/users/accept-friends-request/', async (req, res) => {
  try {
    const io = req.app.locals.io;

    let currentUser = await User.findOne({ displayName: req.body.currentUserDisplayName });
    let user = await User.findOne({ displayName: req.body.userDisplayName });
    const userId = user._id.toString();
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendId) => friendId === userId);

    if (isUserFriendsWithCurrentUser) return res.json({
      message: `You are already friends with ${user.displayName}.`
    });
    else {
      currentUser.friendsRequests.received = currentUser.friendsRequests.received.filter((id) => id !== userId);
      user.friendsRequests.pending = user.friendsRequests.pending.filter((id) => id !== currentUserId);

      currentUser.friends.push(userId);
      user.friends.push(currentUserId);

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

      io.emit("countersListener", JSON.stringify({
        friendsRequestsReceived: currentUser.friendsRequests.received.length,
        userDisplayName: currentUser.displayName
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

router.post('/users/decline-friends-request/', async (req, res) => {
  try {
    const io = req.app.locals.io;

    let currentUser = await User.findOne({ displayName: req.body.currentUserDisplayName });
    let user = await User.findOne({ displayName: req.body.userDisplayName });
    const userId = user._id.toString();
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendId) => friendId === userId);

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

      io.emit("countersListener", JSON.stringify({
        friendsRequestsReceived: currentUser.friendsRequests.received.length,
        userDisplayName: currentUser.displayName
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

router.post('/users/remove-friend/', async (req, res) => {
  try {
    let currentUser = await User.findOne({ displayName: req.body.currentUserDisplayName });
    let user = await User.findOne({ displayName: req.body.userDisplayName });
    const userId = user._id.toString();
    const currentUserId = currentUser._id.toString();

    const isUserFriendsWithCurrentUser = currentUser.friends.find((friendId) => friendId === userId);

    if (!isUserFriendsWithCurrentUser) return res.json({
      message: `${currentUser.displayName} is not friends with ${user.displayName}.`
    });
    else {
      currentUser.friends = currentUser.friends.filter((id) => id !== userId);
      user.friends = user.friends.filter((id) => id !== currentUserId);

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
      res.json({
        message: `${currentUser.displayName} removed ${user.displayName} as a friend.`,
        removedFriend: userId
      })
    }
  } catch (err) {
    res.json({ message: err.message })
  }
});

// Auth

router.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
    const user = new User({
      email: req.body.email,
      displayName: req.body.displayName,
      password: hashedPassword,
      friendsCode: req.body.friendsCode
    });

    user.save().then((result) => {
      const token = jwt.sign(
        {
          userId: result._id,
          userEmail: result.email,
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
      );

      res.status(201).send({
        message: "User Created Successfully",
        result,
        verified: user.verified,
        friendsRequestsReceived: user.friendsRequests.received.length,
        token
      });
    }).catch((error) => {
      res.status(500).send({
        message: "Error creating user",
        error,
      });
    });
  }).catch((e) => {
    res.status(500).send({
      message: "Password was not hashed successfully",
      e,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ displayName: req.body.displayName }).then((user) => {
    bcrypt.compare(req.body.password, user.password).then((passwordCheck) => {
      if (!passwordCheck) {
        return res.status(400).send({
          message: "Wrong password",
          error,
        });
      }
      // create JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          userEmail: user.email,
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
      );

      res.status(200).send({
        message: "Login Successful",
        token,
        verified: user.verified,
        friendsRequestsReceived: user.friendsRequests.received.length
      });
    }).catch((error) => {
      res.status(400).send({
        message: "Wrong password",
        error,
      });
    });
  }).catch((e) => {
    res.status(404).send({
      message: "User not found",
      e,
    });
  });
});

router.post("/change-password", async (req, res) => {
  try {
    const user = await User.findOne({ displayName: req.body.displayName });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Compare current password (using bcrypt)
    const passwordMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Optional: Generate a new JWT token (if needed)

    res.status(200).send({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).send({ message: "Error changing password" });
  }
});

module.exports = router