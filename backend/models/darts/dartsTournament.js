const mongoose = require("mongoose")
const { dartsConn } = require("../../server");

const DartsTournament = new mongoose.Schema({
  name: String,
  tournamentCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['registration', 'in_progress', 'completed'],
    default: 'registration'
  },
  admin: {
    type: String,
    required: true
  },
  settings: {
    type: { type: String, enum: ['bracket', 'ffa'] },
    gameMode: { type: String, default: "X01" },
    startPoints: { type: Number, default: 501 },
    checkOut: { type: String, default: "Double Out" },
    legs: { type: Number, default: 1 },
    sets: { type: Number, default: 0 }
  },
  participants: [
    {
      type: String,
    }
  ],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "DartsTournamentMatch"
  }],
  standings: [{
    player: String,
    wins: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

DartsTournament.pre(/^find/, function (next) {
  this.populate('matches');
  next();
});

module.exports = dartsConn.model('DartsTournament', DartsTournament)