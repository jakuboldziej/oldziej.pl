const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../models/user');
const { logger } = require("./logging");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const authQuery = req.query.token;

  if (!authHeader && !authQuery) {
    return res.status(401).send({ message: "Not authorized. No token provided." });
  }

  try {
    let token;

    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        return res.status(401).send({ message: "Not authorized. Malformed token format." });
      }
    } else if (authQuery) {
      token = authQuery;
    }

    if (process.env.SERVICE_API_KEY && token === process.env.SERVICE_API_KEY) {
      res.authUser = { _id: "123", displayName: "admin", role: "admin" };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await User.findOne({ _id: decoded.userId });

    if (!foundUser) {
      return res.status(403).send({ message: "User not found or deleted." });
    }

    res.authUser = foundUser;
    next();

  } catch (err) {
    logger.error("Authenticate User", { method: req.method, url: req.url, error: err.message });
    if (err.name === 'TokenExpiredError') {
      return res.status(401).send({ message: "Token expired." });
    }
    return res.status(403).send({ message: "Invalid token." });
  }
};

module.exports = authenticateUser;