const mongoose = require("mongoose");
const { ftpConn } = require("../server");

const FtpUserSchema = new mongoose.Schema ({
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
});

module.exports = ftpConn.model('FtpUser', FtpUserSchema)