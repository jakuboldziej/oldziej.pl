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
    unique: false
  },
  favorite: {
    type: Boolean,
    required: true,
    default: false
  },
  shared: {
    type: [Number],
    required: false,
    default: [],
  },
  files: {
    type: [String],
    required: false,
    default: []
  },
  folders: {
    type: [String],
    required: false,
    default: []
  },
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now()
  },
  type: {
    type: String,
    required: false,
    default: "folder"
  }
});

module.exports = ftpConn.model('FtpFolder', FtpFolderSchema)