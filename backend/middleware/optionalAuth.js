const jwt = require("jsonwebtoken");
require('dotenv').config();
const User = require('../models/user');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  const authQuery = req.method === "GET" ? req.query.token : undefined;
  const raw = authHeader || authQuery;

  if (!raw || typeof raw !== "string") return null;
  if (raw === 'undefined' || raw === 'null') return null;

  return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
};

const optionalAuthenticateUser = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) return next();

  try {
    if (process.env.SERVICE_API_KEY && token === process.env.SERVICE_API_KEY) {
      res.authUser = { _id: "000000000000000000000000", displayName: "service", role: "admin", isService: true };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const foundUser = await User.findOne({ _id: decoded.userId });

    if (foundUser) res.authUser = foundUser;
  } catch {
    // an invalid or expired token is treated as no token here
  }

  next();
};

module.exports = optionalAuthenticateUser;
