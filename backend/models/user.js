const mongoose = require("mongoose")
const { dartsConn } = require("../server")

const UserSchema = new mongoose.Schema ({
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
})

module.exports = dartsConn.model('User', UserSchema)