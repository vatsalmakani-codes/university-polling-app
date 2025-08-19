const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Will always be an Admin
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED'],
    default: 'ACTIVE',
  },
  targetAudience: {
    type: String,
    enum: ['STUDENT', 'FACULTY', 'ALL'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  resultsPublished: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Poll', pollSchema);