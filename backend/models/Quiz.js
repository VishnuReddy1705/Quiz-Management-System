const mongoose = require('mongoose');

// Helper to generate a 6-digit Quizizz-style Join Code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Schema for individual questions inside a quiz
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} must have at least 2 options']
  },
  // Index of the correct answer (0, 1, 2, or 3)
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0
  }
});

function arrayLimit(val) {
  return val.length >= 2;
}

// Schema for the entire Quiz
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  // 6-digit unique join code like Quizizz
  quizCode: {
    type: String,
    unique: true,
    default: generateCode
  },
  description: {
    type: String,
    trim: true,
    default: 'Test your knowledge with this quiz.'
  },
  category: {
    type: String,
    default: 'General'
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);
