const mongoose = require("mongoose")
const { dartsConn } = require("../server")

const dartsGameSchema = new mongoose.Schema({
  created_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now()
  },
  users: {
    type: Array,
    required: true
  },
  podiums: {
    type: String,
    required: true
  },
  podium: {
    type: Object,
    required: true
  },
  turn: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    required: true
  },
  gameMode: {
    type: String,
    required: true
  },
  startPoints: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  sets: {
    type: String,
    required: true
  },
  legs: {
    type: String,
    required: true
  },
  round: {
    type: Number,
    required: true
  },
})

module.exports = dartsConn.model('DartsGame', dartsGameSchema)