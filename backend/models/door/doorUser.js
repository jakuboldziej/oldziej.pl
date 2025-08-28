const mongoose = require("mongoose");
const { choresConn } = require("../../server");

const DoorUserSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  pushToken: {
    type: String,
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = choresConn.model("DoorUser", DoorUserSchema);
