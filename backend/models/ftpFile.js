const mongoose = require("mongoose");
const { ftpConn } = require("../server")

const FtpFileSchema = new mongoose.Schema({
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
  },
  folders: {
    type: Array,
    required: true,
    default: []
  },
  type: {
    type: String,
    required: false,
    default: "file"
  },
  shared: {
    type: Array,
    required: true,
    default: []
  },
});

module.exports = ftpConn.model('FtpFile', FtpFileSchema)