# 🏛️ GNOSIS — Quizizz-Style Quiz Engine

A clean full-stack Web Application for **creating, sharing, and attempting quizzes** with **6-Digit Quizizz-style Join PINs**, built with Node.js, Express, MongoDB, React, and Bootstrap.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 (Vite) | Single Page Application (SPA) UI & State Management |
| **Styling** | Bootstrap 5 + Custom CSS | Modern card layouts, option badges, and responsive design |
| **Backend** | Node.js + Express.js | REST API server handling business logic, 6-digit PINs, and scoring |
| **Database** | MongoDB + Mongoose | Document storage for quizzes, questions, and attempt records |
| **API Client** | Axios | Communication between React and Express backend |

---

## 🎮 How the Quizizz-Style PIN System Works

1. **Automatic 6-Digit PIN Generation:**
   * Every newly created quiz is automatically assigned a clean 6-digit number (e.g., `102948`, `583921`) using:
     ```javascript
     function generateCode() {
       return Math.floor(100000 + Math.random() * 900000).toString();
     }
     ```
2. **Joining a Quiz:**
   * **Via PIN:** Students simply enter the 6-digit PIN in the top hero input: `"Have a Quiz Code?"` and click **Join →**.
   * **Via Link:** Direct links with `?code=102948` can also be shared directly on WhatsApp or classroom groups.

---

## 🚀 How to Run the Project

### 1. Start the Backend Server
```bash
cd backend
node server.js
```
*Backend runs on `http://localhost:5050`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🎓 Viva Guide (How to Explain to Your Teacher)

> *"Mam, our system works like **Quizizz** or **Kahoot**:
> 1. When a teacher creates a quiz, the backend generates a unique 6-digit Join PIN stored in the MongoDB `quizCode` field.
> 2. Students don't need complicated URLs — they can simply type the 6-digit PIN in the 'Have a Quiz Code?' box to start playing.
> 3. The backend route `/api/quizzes/:identifier` checks whether the parameter matches a MongoDB ID or a 6-digit Join Code, providing seamless access."*
