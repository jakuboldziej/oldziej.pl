const mongoose = require("mongoose");
const { choresConn } = require("../server");

const ChoresSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  choresList: {
    type: Array,
    required: false,
    default: []
  }
});

module.exports = choresConn.model("Chore", ChoresSchema);