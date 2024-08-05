const express = require("express")
const { Resend } = require("resend");
const router = express.Router()

const resend = new Resend(process.env.RESEND_API_KEY);

router.get("/", async (req, res) => {
  const { data, error } = await resend.emails.send({
    from: "noreply@oldziej.pl",
    to: ["example@oldziej.pl"],
    subject: "hello world",
    html: "<strong>from oldziej.pl!</strong>",
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
});

module.exports = router