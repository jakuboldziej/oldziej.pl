const mongoose = require("mongoose")
const { dartsConn } = require("../../server")

const dartsTournamentMatch = new mongoose.Schema({
  round: Number,
  matchIndex: Number,
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsUser',
    default: null
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsUser',
    default: null
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsGame',
    default: null
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsUser',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = dartsConn.model('DartsTournamentMatch', dartsTournamentMatch)