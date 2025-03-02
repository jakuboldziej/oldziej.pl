const mongoose = require("mongoose")
const { dartsConn } = require("../server")

const UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  friendsCode: {
    type: String,
    required: true
  },
  friends: {
    type: Array,
  },
  friendsRequests: {
    type: Object,
    default: {
      pending: [],
      received: []
    }
  },
  online: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: "user"
  }
})

module.exports = dartsConn.model('User', UserSchema)