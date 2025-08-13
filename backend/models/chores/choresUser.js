const mongoose = require("mongoose");
const { choresConn } = require("../../server");

const ChoresUserSchema = new mongoose.Schema({
  authUserId: {
    type: String,
    required: true
  },
  pushToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = choresConn.model("ChoresUser", ChoresUserSchema);