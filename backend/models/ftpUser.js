const mongoose = require("mongoose");
const { ftpConn } = require("../server")

const FtpUserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  main_folder: {
    type: String,
    required: true,
  }
});

const environment = process.env.NODE_ENV || 'production';
const backendDomain = environment === "production" ? process.env.BACKEND_DOMAIN : process.env.BACKEND_DOMAIN_LOCAL;

FtpUserSchema.post('findOneAndDelete', async function (doc) {
  let url = `${backendDomain}/api/ftp/files?user=${doc.displayName}`;
  const response = await fetch(url);
  const fetchedUserFiles = await response.json();

  fetchedUserFiles.map(async (file) => {
    await fetch(`${backendDomain}/api/ftp/files/${file._id}`, {
      method: "DELETE"
    });
  })
});

module.exports = ftpConn.model('FtpUser', FtpUserSchema)