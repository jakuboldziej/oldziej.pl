const mongoose = require("mongoose")
const { dartsConn } = require("../../server");

const dartsTournament = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    enum: ['registration', 'in_progress', 'completed'],
    default: 'registration'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsUser',
    required: true
  },
  settings: {
    gameMode: { type: String, default: "X01" },
    startPoints: { type: Number, default: 501 },
    checkOut: { type: String, default: "Double Out" },
    legs: { type: Number, default: 1 },
    sets: { type: Number, default: 0 }
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DartsUser'
    }
  ],
  matches: [{
    round: Number,
    matchIndex: Number,
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'DartsUser' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'DartsUser' },
    gameCode: { type: String },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'DartsUser' },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' }
  }],
}, {
  timestamps: true
});

module.exports = dartsConn.model('DartsTournament', dartsTournament)