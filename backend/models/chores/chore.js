const mongoose = require("mongoose");
const { choresConn } = require("../../server");

const ChoresSchema = new mongoose.Schema({
  ownerId: {
    type: String,
    required: true
  },
  usersList: [{
    displayName: {
      type: String,
      required: true
    },
    finished: {
      type: Boolean,
      required: false,
      default: false
    }
  }],
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