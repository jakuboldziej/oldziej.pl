const mongoose = require("mongoose");
const { esp32Conn } = require("../../../server");

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

module.exports = esp32Conn.model("DoorUser", DoorUserSchema);