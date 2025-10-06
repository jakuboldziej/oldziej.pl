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
  },
  isRepeatable: {
    type: Boolean,
    required: false,
    default: false
  },
  intervalType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: false
  },
  customDays: {
    type: Number,
    min: 1,
    max: 365,
    required: false
  },
  nextDueDate: {
    type: Date,
    required: false
  },
  lastCompletedDate: {
    type: Date,
    required: false
  },
  repeatable: {
    type: Boolean,
    required: false,
    default: false
  }
}, {
  timestamps: true
});

module.exports = choresConn.model("Chore", ChoresSchema);