const mongoose = require('mongoose');
const { esp32Conn } = require("../../../server");

const GeoAuthSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = esp32Conn.model('GeoAuthorizedDevice', GeoAuthSchema);
