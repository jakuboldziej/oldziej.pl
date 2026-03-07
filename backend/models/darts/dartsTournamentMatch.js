const mongoose = require("mongoose")
const { dartsConn } = require("../../server")

const DartsTournamentMatch = new mongoose.Schema({
  round: Number,
  matchIndex: Number,
  player1: {
    type: String,
    default: null
  },
  player2: {
    type: String,
    default: null
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsGame',
    default: null
  },
  winner: {
    type: String,
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

module.exports = dartsConn.model('DartsTournamentMatch', DartsTournamentMatch)