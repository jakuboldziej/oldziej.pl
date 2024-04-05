const { ftpConn } = require("../server");
const { mongoose } = require("mongoose");

const FtpFolderSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
    unique: false
  },
  owner: {
    type: String,
    required: true,
    unique: true
  },
  shared: {
    type: [Number],
    required: false,
    default: [],
  },
  fileIds: {
    type: [String],
    required: false,
    default: []
  }
});

module.exports = ftpConn.model('FtpFolder', FtpFolderSchema)