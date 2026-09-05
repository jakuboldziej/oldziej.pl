const jwt = require("jsonwebtoken");
require('dotenv').config();

const EMAIL_TOKEN_TTL = "1h";

const createEmailActionToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: EMAIL_TOKEN_TTL });

const verifyEmailActionToken = (token, purpose) => {
  if (!token || typeof token !== "string") return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== purpose) return null;
    return decoded;
  } catch {
    return null;
  }
};

module.exports = { createEmailActionToken, verifyEmailActionToken };
