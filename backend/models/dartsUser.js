const mongoose = require("mongoose")

const dartsUserSchema = new mongoose.Schema ({
  displayName: {
    type: String,
    required: true
  },
  gamesPlayed: {
    type: Number,
    required: true
  },
  podiums: {
    type: Object,
    required: true
  },
  overAllPoints: {
    type: Number,
    required: true
  },
  highestEndingAvg: {
    type: Number,
    required: true
  },
  highestOuts: {
    type: Number,
    required: true
  },
  highestRoundPoints: {
    type: Number,
    required: true
  },
  throws: {
    type: Object,
    required: true
  },
})

module.exports = mongoose.model('DartsUser', dartsUserSchema)