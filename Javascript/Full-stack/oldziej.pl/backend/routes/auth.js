const express = require("express")
const router = express.Router()
const User = require('../models/user')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
    const user = new User({
      email: req.body.email,
      displayName: req.body.displayName,
      password: hashedPassword,
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
          message: "Passwords does not match",
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
      });
    }).catch((error) => {
      res.status(400).send({
        message: "Passwords does not match",
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
    console.log(req.body.currentPassword, user.password);
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