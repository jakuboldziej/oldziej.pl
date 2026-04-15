const { ftpConn } = require("../server");
const { mongoose } = require("mongoose");

const FtpFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  ownerId: {
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
  },
  type: {
    type: String,
    required: false,
    default: "folder"
  }
}, {
  timestamps: true
});

FtpFolderSchema.post('findOneAndDelete', async function (doc) {
  if (!doc || !doc.folders || doc.folders.length === 0) return;

  const FtpFolder = this.model('FtpFolder');

  try {
    await Promise.all(
      doc.folders.map(async (folderId) => {
        await FtpFolder.findByIdAndDelete(folderId);
      })
    );
    console.info(`Cascade: Deleted ${doc.folders.length} subfolders for folder ${doc._id}`);
  } catch (error) {
    console.error("Error during FtpFolder cascade subfolder deletion:", error);
  }
});

module.exports = ftpConn.model('FtpFolder', FtpFolderSchema);