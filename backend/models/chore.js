const mongoose = require("mongoose");
const { choresConn } = require("../server");

const ChoresSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    required: true
  },
  usersList: {
    type: Array,
    required: false,
    default: []
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  finished: {
    type: Boolean,
    required: false,
    default: false
  }
}, {
  timestamps: true
});

module.exports = choresConn.model("Chore", ChoresSchema);