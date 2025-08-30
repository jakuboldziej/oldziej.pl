const mongoose = require('mongoose');
const { esp32Conn } = require("../../server");

const esp32ConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  config: {
    type: Object,
    required: true
  }
}, { timestamps: true });

module.exports = esp32Conn.model('ESP32Config', esp32ConfigSchema);