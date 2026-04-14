const mongoose = require("mongoose");
const { ftpConn } = require("../server");

const FtpFile = require("./ftpFile"); 

const FtpUserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  main_folder: {
    type: String,
    required: false,
  }
}, {
  timestamps: true
});

FtpUserSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;

  try {
    await FtpFile.deleteMany({ userId: doc._id });
    console.log(`Cascade: Deleted all files for user ${doc._id}`);
  } catch (error) {
    console.error("Error during FtpUser cascade file deletion:", error);
  }
});

module.exports = ftpConn.model('FtpUser', FtpUserSchema);