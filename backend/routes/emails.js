const express = require("express");
const { Resend } = require("resend");
const router = express.Router();
const User = require("../models/user");

import VerifyEmail from '../emails/VerifyEmail';

const environment = process.env.NODE_ENV || "production";

const resend = new Resend(process.env.RESEND_API_KEY);

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

      res.redirect(`${domain}/verified?userEmail=${user.email}`);
    }
  } catch (err) {
    console.log(err.message);
    res.json({ err: err.message })
  }
});

module.exports = router;