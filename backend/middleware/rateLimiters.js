const rateLimit = require("express-rate-limit");

const createRateLimiter = (maxAttempts, windowMs, message) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max: maxAttempts, // Max attempts allowed within the window
    message: { message }, // Custom message
    standardHeaders: true, // Include rate limit headers
    legacyHeaders: false, // Disable deprecated headers
  });
};

module.exports = { createRateLimiter };