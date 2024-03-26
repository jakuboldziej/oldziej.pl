const express = require("express");
const router = express.Router()

router.post('/api/ftp/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file })
})

module.exports = router