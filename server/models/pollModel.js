const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  optionText: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  
  // NEW: Add a field to define the poll type
  pollType: {
    type: String,
    enum: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'],
    required: true,
    default: 'SINGLE_CHOICE',
  },
});

module.exports = mongoose.model('Poll', pollSchema);