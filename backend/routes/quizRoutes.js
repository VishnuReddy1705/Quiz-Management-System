const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fallback in-memory storage with 6-digit Quizizz-style Join Codes
let inMemoryQuizzes = [
  {
    _id: 'mock-quiz-1',
    quizCode: '102948',
    title: 'Web Technologies & HTML/CSS Basics',
    description: 'Fundamental questions on Web Development, HTML elements, and CSS styling.',
    category: 'Web Development',
    createdAt: new Date(),
    questions: [
      {
        questionText: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Multi Language',
          'Hyperlink and Text Management Language',
          'Home Tool Markup Language'
        ],
        correctAnswerIndex: 0
      },
      {
        questionText: 'Which CSS property is used to change the background color of an element?',
        options: ['color', 'bgcolor', 'background-color', 'canvas-color'],
        correctAnswerIndex: 2
      },
      {
        questionText: 'Which HTTP method is typically used to request data from a server in a REST API?',
        options: ['POST', 'GET', 'DELETE', 'PUT'],
        correctAnswerIndex: 1
      },
      {
        questionText: 'Which tag is used to define an internal stylesheet in HTML?',
        options: ['<script>', '<css>', '<style>', '<link>'],
        correctAnswerIndex: 2
      }
    ]
  },
  {
    _id: 'mock-quiz-2',
    quizCode: '583921',
    title: 'JavaScript & Node.js Essentials',
    description: 'Test your understanding of JavaScript core concepts and Node runtime.',
    category: 'Programming',
    createdAt: new Date(),
    questions: [
      {
        questionText: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
        options: ['var', 'let', 'const', 'static'],
        correctAnswerIndex: 2
      },
      {
        questionText: 'In Node.js, which built-in module is used to create HTTP web servers?',
        options: ['fs', 'http', 'path', 'url'],
        correctAnswerIndex: 1
      },
      {
        questionText: 'What is the format used for storing documents in MongoDB?',
        options: ['XML', 'BSON (Binary JSON)', 'CSV', 'SQL Tables'],
        correctAnswerIndex: 1
      }
    ]
  }
];
let inMemoryResults = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// 1. GET ALL QUIZZES
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const quizzes = await Quiz.find().sort({ createdAt: -1 });
      const summary = quizzes.map(q => ({
        _id: q._id,
        quizCode: q.quizCode,
        title: q.title,
        description: q.description,
        category: q.category,
        questionCount: q.questions.length,
        createdAt: q.createdAt
      }));
      return res.json(summary);
    } else {
      const summary = inMemoryQuizzes.map(q => ({
        _id: q._id,
        quizCode: q.quizCode,
        title: q.title,
        description: q.description,
        category: q.category,
        questionCount: q.questions.length,
        createdAt: q.createdAt
      }));
      return res.json(summary);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
});

// 2. GET SINGLE QUIZ BY ID OR 6-DIGIT CODE
router.get('/:identifier', async (req, res) => {
  try {
    const id = req.params.identifier;
    let quiz = null;

    if (isDbConnected()) {
      // Find either by MongoDB ObjectId or 6-digit quizCode
      if (mongoose.Types.ObjectId.isValid(id)) {
        quiz = await Quiz.findById(id);
      }
      if (!quiz) {
        quiz = await Quiz.findOne({ quizCode: id });
      }
      if (!quiz) return res.status(404).json({ message: 'Quiz not found. Check the code and try again.' });
      return res.json(quiz);
    } else {
      // Find in memory by either _id or quizCode
      quiz = inMemoryQuizzes.find(q => String(q._id) === id || String(q.quizCode) === id);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found. Check the code and try again.' });
      return res.json(quiz);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
});

// 3. CREATE NEW QUIZ (Generates 6-digit Quiz Code)
router.post('/', async (req, res) => {
  try {
    const { title, description, category, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required.' });
    }

    const code = generateCode();

    if (isDbConnected()) {
      const newQuiz = new Quiz({
        title,
        quizCode: code,
        description: description || 'Take this quiz to test your knowledge.',
        category: category || 'General',
        questions
      });
      const savedQuiz = await newQuiz.save();
      return res.status(201).json({ message: 'Quiz created successfully', quiz: savedQuiz });
    } else {
      const newQuiz = {
        _id: 'mock-quiz-' + Date.now(),
        quizCode: code,
        title,
        description: description || 'Take this quiz to test your knowledge.',
        category: category || 'General',
        questions,
        createdAt: new Date()
      };
      inMemoryQuizzes.unshift(newQuiz);
      return res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error creating quiz', error: error.message });
  }
});

// 4. SUBMIT QUIZ & CALCULATE RESULT (Works with ID or Code)
router.post('/:identifier/submit', async (req, res) => {
  try {
    const id = req.params.identifier;
    const { studentName, answers } = req.body;
    let quiz = null;

    if (isDbConnected()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        quiz = await Quiz.findById(id);
      }
      if (!quiz) {
        quiz = await Quiz.findOne({ quizCode: id });
      }
    } else {
      quiz = inMemoryQuizzes.find(q => String(q._id) === id || String(q.quizCode) === id);
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;
    const review = [];

    quiz.questions.forEach((q, index) => {
      const selectedIndex = answers ? answers[index] : undefined;
      const isCorrect = selectedIndex !== undefined && Number(selectedIndex) === q.correctAnswerIndex;

      if (isCorrect) {
        score++;
      }

      review.push({
        questionNumber: index + 1,
        questionText: q.questionText,
        options: q.options,
        selectedAnswer: selectedIndex !== undefined ? q.options[selectedIndex] : 'Not Answered',
        correctAnswer: q.options[q.correctAnswerIndex],
        isCorrect
      });
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const name = studentName && studentName.trim() ? studentName.trim() : 'Guest Student';

    if (isDbConnected()) {
      const resultRecord = new Result({
        quizId: quiz._id,
        quizTitle: quiz.title,
        studentName: name,
        score,
        totalQuestions,
        percentage
      });
      await resultRecord.save();
    } else {
      inMemoryResults.unshift({
        _id: 'result-' + Date.now(),
        quizId: quiz._id,
        quizTitle: quiz.title,
        studentName: name,
        score,
        totalQuestions,
        percentage,
        submittedAt: new Date()
      });
    }

    res.json({
      message: 'Quiz evaluated successfully',
      result: {
        studentName: name,
        quizTitle: quiz.title,
        quizCode: quiz.quizCode,
        score,
        totalQuestions,
        percentage,
        review
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
});

// 5. DELETE QUIZ
router.delete('/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const deleted = await Quiz.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Quiz not found' });
      return res.json({ message: 'Quiz deleted successfully' });
    } else {
      const index = inMemoryQuizzes.findIndex(q => String(q._id) === String(req.params.id));
      if (index === -1) return res.status(404).json({ message: 'Quiz not found' });
      inMemoryQuizzes.splice(index, 1);
      return res.json({ message: 'Quiz deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
});

// 6. GET RESULTS / HISTORY
router.get('/data/results', async (req, res) => {
  try {
    if (isDbConnected()) {
      const results = await Result.find().sort({ submittedAt: -1 }).limit(20);
      return res.json(results);
    } else {
      return res.json(inMemoryResults.slice(0, 20));
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
});

module.exports = router;
