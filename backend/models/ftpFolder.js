const { ftpConn } = require("../server")
const { mongoose } = require("mongoose");

const FtpFolderSchema = new mongoose.Schema({
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

const environment = process.env.NODE_ENV || 'production';
const backendDomain = environment === "production" ? process.env.BACKEND_DOMAIN : process.env.BACKEND_DOMAIN_LOCAL;

FtpFolderSchema.post('findOneAndDelete', async function (doc) {
  doc.folders.map(async (folderId) => {
    await fetch(`${backendDomain}/api/ftp/folders/${folderId}`, {
      method: "DELETE"
    });
  });
});

module.exports = ftpConn.model('FtpFolder', FtpFolderSchema)