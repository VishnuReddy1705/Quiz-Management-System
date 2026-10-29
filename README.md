# 🏛️ GNOSIS — Online Quiz Management & Assessment System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://quiz-management-system-teal.vercel.app)
[![React](https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Bootstrap](https://img.shields.io/badge/Styling-Bootstrap_5-purple?style=for-the-badge&logo=bootstrap)](https://getbootstrap.com)

A full-stack, gamified web application for **creating, sharing, and attempting interactive assessments** with **Quizizz-style 6-Digit Join PINs** and **Kahoot-style 2x2 color-coded option grids**.

---

## 🌐 Live Application
* **Production URL:** [https://quiz-management-system-teal.vercel.app](https://quiz-management-system-teal.vercel.app)
* **GitHub Repository:** [https://github.com/VishnuReddy1705/Quiz-Management-System](https://github.com/VishnuReddy1705/Quiz-Management-System)

---

## 🛠️ Technology Stack

| Layer | Technology | Role & Functionality |
|---|---|---|
| **Frontend Framework** | **React 19 (Vite)** | Single Page Application (SPA), component modularity, dynamic state management |
| **Styling & UI** | **Bootstrap 5 + Custom CSS** | Responsive 2x2 grid, vibrant color badges, and clean layout |
| **Backend Runtime** | **Node.js** | Server-side execution environment |
| **Server Framework** | **Express.js** | RESTful API routing, JSON serialization, and secure answer evaluation |
| **Database** | **MongoDB + Mongoose** | Document persistence for quizzes, questions, and student submission logs |
| **HTTP Client** | **Axios** | Asynchronous promise-based API communication between React and Express |
| **Deployment** | **Vercel** | Global edge hosting and continuous integration for the client interface |

---

## ✨ Key Features & Functionality

### 1. 🎮 Quizizz-Style 6-Digit Join PIN System
* Every quiz is assigned a unique 6-digit numeric PIN upon creation (e.g., `102948`).
* Students can immediately join a quiz by typing the 6-digit PIN in the top **"Have a Quiz Code?"** portal.
* Deep-linking is also supported: sharing `https://quiz-management-system-teal.vercel.app/?code=102948` opens that specific quiz directly.

### 2. 🎨 Kahoot-Style 2x2 Color-Coded Option Grid
* Questions present choices in an ergonomic 2x2 grid layout (2 options on the left, 2 on the right):
  * **Option A (Top-Left):** Crimson Red
  * **Option B (Top-Right):** Sky Blue
  * **Option C (Bottom-Left):** Amber Yellow
  * **Option D (Bottom-Right):** Emerald Green
* Includes hover lift animations, active selection indicators, and responsive mobile adaptation.

### 3. ⏱️ Client-Side Countdown Timer & Auto-Submit
* Dynamically allocates test time based on question count (30 seconds per question).
* The timer badge turns red and pulsates when less than 15 seconds remain.
* Automatically forces submission to the server when the clock hits `00:00`.

### 4. 🔀 Anti-Cheating Question Randomization
* Automatically shuffles question order upon test initialization, mitigating unfair practices between adjacent test takers.

### 5. 🔒 Secure Server-Side Score Calculation
* To prevent client-side inspection or tampering, student answers are evaluated strictly on the backend:
  * Calculates final score, accuracy percentage, and pass/fail standing.
  * Yields a detailed breakdown comparing selected choices versus actual correct answers.

### 6. 🖨️ Printable Scorecard & PDF Generation
* Students can click **"Download Scorecard (PDF)"** on the results screen.
* Uses clean print-media CSS (`@media print`) that removes web navigation chrome and produces an official assessment certificate.

### 7. 🏆 Tiered Achievement Badges & Live Leaderboard
* Performance tiers:
  * **90% - 100%:** 🏆 *Gold Scholar (Mastery)*
  * **70% - 89%:** 🥈 *Silver Achiever (Proficient)*
  * **50% - 69%:** 🥉 *Bronze Finisher (Passing)*
  * **Below 50%:** 📚 *Revision Recommended*
* A live audit table tracks candidate names, quiz titles, marks, and timestamps.

---

## 🏗️ Project Architecture & Data Flow

```
[ Student / Teacher Browser ] (React 19 + Bootstrap 5 on Vercel)
               │
               ▼  HTTP REST Requests (Axios)
    [ Express API Backend ] (Port 5050 / Cloud Web Service)
               │
               ├─► POST /api/quizzes/submit  ──► Validates answers & calculates score
               ├─► POST /api/quizzes         ──► Generates 6-digit code & creates quiz
               ├─► GET  /api/quizzes/:id     ──► Fetches questions by ID or 6-digit PIN
               │
               ▼  Mongoose Driver
         [ MongoDB Database ]
         ├── quizzes Collection
         └── results Collection
```

---

## 🗄️ Database Schemas (Mongoose)

### 1. `Quiz` Collection
```javascript
{
  title: String,
  quizCode: { type: String, unique: true }, // e.g., "102948"
  description: String,
  category: String,
  questions: [
    {
      questionText: String,
      options: [String],        // 4 options: [A, B, C, D]
      correctAnswerIndex: Number // 0, 1, 2, or 3
    }
  ],
  createdAt: { type: Date, default: Date.now }
}
```

### 2. `Result` Collection
```javascript
{
  quizId: ObjectId,
  quizTitle: String,
  studentName: String,
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  submittedAt: { type: Date, default: Date.now }
}
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quizzes` | Returns summary list of all quizzes and question counts |
| `GET` | `/api/quizzes/:identifier` | Fetches quiz details by MongoDB ObjectId or 6-digit Join Code |
| `POST` | `/api/quizzes` | Saves a newly authored quiz and generates a 6-digit PIN |
| `POST` | `/api/quizzes/:identifier/submit` | Evaluates submitted choices and records student score |
| `DELETE` | `/api/quizzes/:id` | Deletes a quiz by ID |
| `GET` | `/api/quizzes/data/results` | Returns recent student submissions for the leaderboard |

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (Local Community Server, Compass, or MongoDB Atlas URI)

### 1. Clone Repository
```bash
git clone https://github.com/VishnuReddy1705/Quiz-Management-System.git
cd Quiz-Management-System
```

### 2. Start Backend Server
```bash
cd backend
npm install
node server.js
```
*Backend runs on `http://localhost:5050` and connects to `mongodb://127.0.0.1:27017/quiz_db`.*

### 3. Start Frontend App
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs locally on `http://localhost:5173`.*

---

## 🎓 Viva & Presentation Talking Points

* **Architecture:** Decoupled client-server design where React acts as a Single Page Application communicating through RESTful JSON endpoints.
* **Why MongoDB?** Quizzes represent hierarchical, polymorphic data structures (quizzes contain nested question arrays, and questions contain option arrays). MongoDB's BSON document model stores this without relational join overhead.
* **Security:** Answer evaluation is performed strictly on the Node.js backend to prevent client-side answer sniffing.
* **Deployment:** Client application is hosted on **Vercel** with continuous deployment from GitHub.

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
