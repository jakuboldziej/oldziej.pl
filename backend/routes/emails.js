const express = require("express");
const { Resend } = require("resend");
const router = express.Router();
const User = require("../models/user");

import ChangeEmail from '../emails/ChangeEmail';
import VerifyEmail from '../emails/VerifyEmail';

const environment = process.env.NODE_ENV || "production";

const resend = new Resend(process.env.RESEND_API_KEY);

// Veryfing Email

router.post("/send-verify-email", async (req, res) => {
  const { userEmail } = req.body;

  const { data, error } = await resend.emails.send({
    from: "oldziej.pl <noreply@oldziej.pl>",
    to: userEmail,
    subject: "Email Verification",
    react: VerifyEmail({ userEmail: userEmail })
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
});

router.get("/verify-email", async (req, res) => {
  try {
    const io = req.app.locals.io;

    const userEmail = req.query.userEmail;
    const user = await User.findOne({ email: userEmail }, { password: 0 });

    const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;
    if (user === null || user?.verified === true) res.redirect(domain);
    else {
      await User.updateOne({ _id: user._id }, {
        verified: true,
      });

      io.emit("verifyEmail", JSON.stringify({
        userDisplayName: user.displayName,
        verified: true
      }));

      res.redirect(`${domain}/success?verified=true`);
    }
  } catch (err) {
    res.json({ err: err.message });
  }
});

// Changing Email

router.put("/send-change-email", async (req, res) => {
  const { userEmail, newUserEmail } = req.body;

  const existingUser = await User.findOne({ email: newUserEmail });

  if (existingUser) return res.json({ error: "User with that email already exists!" });

  const { data, error } = await resend.emails.send({
    from: "oldziej.pl <noreply@oldziej.pl>",
    to: userEmail,
    subject: "Change Your Email",
    react: ChangeEmail({ userEmail, newUserEmail })
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
});

router.get("/change-email", async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    const newUserEmail = req.query.newUserEmail;
    const user = await User.findOne({ email: userEmail }, { password: 0 });

    const domain = environment === "production" ? process.env.DOMAIN : process.env.DOMAIN_LOCAL;
    if (user === null || userEmail === newUserEmail) res.redirect(domain);
    else {
      await User.updateOne({ _id: user._id }, {
        email: newUserEmail
      });

      res.redirect(`${domain}/success?newUserEmail=true`);
    }
  } catch (err) {
    res.json({ err: err.message })
  }
});

module.exports = router;