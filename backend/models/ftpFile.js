const mongoose = require("mongoose");
const { ftpConn } = require("../server");

const FtpFileSchema = new mongoose.Schema ({
  fileId: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  favorite: {
    type: Boolean,
    required: true,
    default: false
  },
  lastModified: {
    type: Number,
    required: true
  }
});

module.exports = ftpConn.model('FtpFile', FtpFileSchema)