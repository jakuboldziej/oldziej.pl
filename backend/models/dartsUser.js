const mongoose = require("mongoose")
const { dartsConn } = require("../server")

const dartsUserSchema = new mongoose.Schema ({
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  gamesPlayed: {
    type: Number,
    required: true,
    default: 0
  },
  podiums: {
    type: Object,
    required: true,
    default: {
      firstPlace: 0,
      secondPlace: 0,
      thirdPlace: 0
    }
  },
  overAllPoints: {
    type: Number,
    required: true,
    default: 0
  },
  highestEndingAvg: {
    type: Number,
    required: true,
    default: 0
  },
  highestRoundPoints: {
    type: Number,
    required: true,
    default: 0
  },
  highestCheckout: {
    type: Number,
    required: true,
    default: 0
  },
  throws: {
    type: Object,
    required: true,
    default: {
      normal: 0,
      doubles: 0,
      tripes: 0,
      overthrows: 0,
      doors: 0
    }
  },
})

module.exports = dartsConn.model('DartsUser', dartsUserSchema)