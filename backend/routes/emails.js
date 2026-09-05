const express = require("express");
const router = express.Router();
const User = require("../models/user");

import authenticateUser from '../middleware/auth';
import { verifyEmailActionToken } from '../lib/emailTokens';
import { createRateLimiter } from '../middleware/rateLimiters';
import { logger } from '../middleware/logging';
import { sendChangeEmailRequest, sendVerificationEmail } from '../services/emailService';
import { io } from '../server';

const environment = process.env.NODE_ENV || "production";

const sendEmailLimiter = createRateLimiter(5, 60 * 60 * 1000, "Too many email requests. Try again later.");

// Veryfing Email

router.post("/send-verify-email", sendEmailLimiter, authenticateUser, async (req, res) => {
  try {
    const userEmail = res.authUser.email;

    if (!userEmail) return res.status(400).json({ message: "Account has no email address." });
    if (res.authUser.verified === true) return res.json({ message: "Email already verified." });

    const { data, error } = await sendVerificationEmail(res.authUser);

    if (error) {
      return res.status(400).json(error);
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error("POST SendVerifyEmail", { method: req.method, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.get("/verify-email", async (req, res) => {
  const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;

  try {
    const payload = verifyEmailActionToken(req.query.token, "verify-email");

    if (!payload) return res.redirect(`${domain}/?error=invalid-link`);

    const user = await User.findById(payload.userId);

    if (user === null || user.email !== payload.userEmail || user.verified === true) {
      return res.redirect(domain);
    }

    await User.updateOne({ _id: user._id }, {
      verified: true,
    });

    io.emit("verifyEmail", JSON.stringify({
      userDisplayName: user.displayName,
      verified: true
    }));

    res.redirect(`${domain}/success?verified=true`);
  } catch (err) {
    logger.error("GET VerifyEmail", { method: req.method, error: err.message });
    res.redirect(`${domain}/?error=verification-failed`);
  }
});

// Changing Email

router.patch("/send-change-email", sendEmailLimiter, authenticateUser, async (req, res) => {
  try {
    const { newUserEmail } = req.body;
    const userEmail = res.authUser.email;

    if (!newUserEmail || typeof newUserEmail !== "string") {
      return res.status(400).json({ error: "New email is required." });
    }

    if (newUserEmail === userEmail) {
      return res.json({ error: "New email is the same as the current one." });
    }

    const existingUser = await User.findOne({ email: newUserEmail });

    if (existingUser) return res.json({ error: "User with that email already exists!" });

    const { data, error } = await sendChangeEmailRequest(res.authUser, newUserEmail);

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ data });
  } catch (err) {
    logger.error("PATCH SendChangeEmail", { method: req.method, error: err.message });
    res.status(500).json({ message: err.message });
  }
});

router.get("/change-email", async (req, res) => {
  const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;

  try {
    const payload = verifyEmailActionToken(req.query.token, "change-email");

    if (!payload) return res.redirect(`${domain}/?error=invalid-link`);

    const user = await User.findById(payload.userId);

    if (user === null || user.email !== payload.userEmail) {
      return res.redirect(domain);
    }

    const existingUser = await User.findOne({ email: payload.newUserEmail });

    if (existingUser) return res.redirect(`${domain}/?error=email-taken`);

    await User.updateOne({ _id: user._id }, {
      email: payload.newUserEmail,
      verified: false
    });

    res.redirect(`${domain}/success?newUserEmail=true`);
  } catch (err) {
    logger.error("GET ChangeEmail", { method: req.method, error: err.message });
    res.redirect(`${domain}/?error=change-email-failed`);
  }
});

module.exports = router;
