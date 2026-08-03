const mongoose = require("mongoose")
const { dartsConn } = require("../server")

const QuoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = dartsConn.model('Quote', QuoteSchema)