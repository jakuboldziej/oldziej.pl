const mongoose = require("mongoose")
const { dartsConn } = require("../../server")

const DartsGame = new mongoose.Schema({
  created_by: {
    type: String,
    required: true
  },
  finished_at: {
    type: Date,
    required: false
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
    required: false,
    default: { 1: null, 2: null, 3: null }
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
  gameCode: {
    type: String,
    required: true
  },
  training: {
    type: Boolean,
    required: true,
    default: false
  },
  record: {
    type: Array,
    required: false
  },
  legStarterIndex: {
    type: Number,
    required: false
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsTournament',
    default: null
  },
  tournamentMatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DartsTournamentMatch',
    default: null
  },
}, {
  timestamps: true
});

DartsGame.pre(/^find/, function (next) {
  this.populate({
    path: "tournamentId",
    select: "tournamentCode status admin matches"
  });

  next();
});

module.exports = dartsConn.model('DartsGame', DartsGame)