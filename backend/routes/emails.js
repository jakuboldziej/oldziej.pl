const express = require("express")
const { Resend } = require("resend");
const router = express.Router()
const User = require('../models/user')

const environment = process.env.NODE_ENV || 'production';

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/send-verify-email", async (req, res) => {
  const { userEmail } = req.body;

  const { data, error } = await resend.emails.send({
    from: "Oldziej.pl <noreply@oldziej.pl>",
    to: userEmail,
    subject: "Email Verification",
    html: `<a href="http://localhost:3000/api/emails/verify-email?userEmail=${userEmail}">Verify Email</a>`,
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
});

router.get("/verify-email", async (req, res) => {
  const io = req.app.locals.io;

  const userEmail = req.query.userEmail;
  const user = await User.findOne({ email: userEmail }, { password: 0 });

  const domain = environment === "production" ? process.env.DOMAIN : process.env.LOCAL;
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
});

module.exports = router