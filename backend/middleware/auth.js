const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../models/user')

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Not authorized." });
  }

  try {
    if (authHeader.split(" ")[0] === "Bearer") {
      if (authHeader.split(" ")[1] === process.env.JWT_SECRET) return next();
    }

    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    const foundUser = await User.findOne({ _id: decoded.userId });

    if (!foundUser) res.status(403).send({ message: "User not authenticated." });

    next();
  } catch (err) {
    res.status(403).send({ message: "User not authenticated." });
  }
};

module.exports = authenticateUser;