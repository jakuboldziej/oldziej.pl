const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../models/user');
const { logger } = require("./logging");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const authQuery = req.query.token;

  if (!authHeader && !authQuery) {
    return res.status(401).send({ message: "Not authorized." });
  }

  try {
    const token = authHeader ? authHeader : authQuery;

    if (token.split(" ")[0] === "Bearer") {
      if (token.split(" ")[1] === process.env.JWT_SECRET) return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await User.findOne({ _id: decoded.userId });

    if (!foundUser) res.status(403).send({ message: "User not authenticated." });

    next();
  } catch (err) {
    logger.error("Authenticate User", { method: req.method, url: req.url, error: err.message });
    res.status(403).send({ message: "User not authenticated." });
  }
};

module.exports = authenticateUser;