const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const Quiz = require('./models/Quiz');
const Result = require('./models/Result');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
const PORT = process.env.PORT || 5050;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quiz_db';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quizzes', quizRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Quiz Management API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected (MongoDB)' : 'Connecting / Standalone'
  });
});

// Initial sample quizzes for demo/viva with 6-digit Quizizz codes
const sampleQuizzes = [
  {
    quizCode: '102948',
    title: 'Web Technologies & HTML/CSS Basics',
    description: 'Fundamental questions on Web Development, HTML elements, and CSS styling.',
    category: 'Web Development',
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
    quizCode: '583921',
    title: 'JavaScript & Node.js Essentials',
    description: 'Test your understanding of JavaScript core concepts and Node runtime.',
    category: 'Programming',
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

// Keep mongod instance reference alive so GC doesn't clean it
let globalMongod = null;

// Seed sample data if database is empty
async function seedDefaultQuizzes() {
  try {
    const count = await Quiz.countDocuments();
    if (count === 0) {
      await Quiz.insertMany(sampleQuizzes);
      console.log('🌱 Sample demo quizzes seeded successfully into MongoDB collection [quizzes]!');
    }
  } catch (err) {
    console.warn('Note: Could not auto-seed database:', err.message);
  }
}

// Connect to MongoDB with automated local engine startup
async function startDatabase() {
  try {
    // 1. Try connecting directly
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Successfully connected to MongoDB at:', MONGODB_URI);
    await seedDefaultQuizzes();
  } catch (initialErr) {
    // 2. If connection failed, auto-launch local MongoDB server!
    console.log('⚡ Launching local MongoDB server on port 27017 for MongoDB Compass...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      globalMongod = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'quiz_db'
        }
      });
      MONGODB_URI = 'mongodb://127.0.0.1:27017/quiz_db';
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Local MongoDB Server is active and listening on port 27017!');
      console.log('🎯 MongoDB Compass can now connect to: mongodb://localhost:27017');
      await seedDefaultQuizzes();
    } catch (embedErr) {
      console.warn('⚠️ Could not launch embedded MongoDB:', embedErr.message);
    }
  }
}

startDatabase();

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Quiz Backend Server running on http://localhost:${PORT}`);
});

// Prevent process from closing
setInterval(() => {}, 1 << 30);
