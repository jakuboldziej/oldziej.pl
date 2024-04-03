const express = require("express")
const router = express.Router()
const User = require('../models/user')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hashedPassword) => {
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      displayName: req.body.displayName
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

module.exports = router