import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function TakeQuiz({ quizId, onBackToList }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Student input and answers
  const [studentName, setStudentName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: optionIndex }
  
  // Submission & Result state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Countdown Timer State (default 120 seconds for the quiz)
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef(null);

  // Fetch the quiz by ID or 6-digit code
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5050/api/quizzes/${quizId}`);
        const data = response.data;
        
        // Anti-Cheating: Randomize question order on quiz load
        const shuffledQuestions = [...data.questions].sort(() => Math.random() - 0.5);
        setQuiz({ ...data, questions: shuffledQuestions });
        
        // Set timer based on question count (30 seconds per question, min 60s)
        const allocatedSeconds = Math.max(60, shuffledQuestions.length * 30);
        setTimeLeft(allocatedSeconds);
      } catch (err) {
        setError('Failed to find quiz. Please check the Quiz Code and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || result || !quiz) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, result, quiz, answers]);

  // Auto-submit when time expires
  const handleAutoSubmit = async () => {
    alert('⏱️ Time has expired! Your quiz is being submitted automatically.');
    submitAnswers();
  };

  const displayCode = quiz?.quizCode || quiz?._id || quizId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}${window.location.pathname}?code=${displayCode}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentIndex]: optionIndex
    });
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const response = await axios.post(`http://localhost:5050/api/quizzes/${quizId}/submit`, {
        studentName: studentName.trim() || 'Guest Student',
        answers
      });
      setResult(response.data.result);
    } catch (err) {
      alert('Error submitting quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    submitAnswers();
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    if (quiz) {
      const allocatedSeconds = Math.max(60, quiz.questions.length * 30);
      setTimeLeft(allocatedSeconds);
    }
  };

  // Helper for Achievement Badges
  const getAchievementBadge = (percentage) => {
    if (percentage >= 90) {
      return {
        title: 'Gold Scholar (Mastery)',
        icon: '🏆',
        color: '#b45309',
        bgColor: '#fef3c7',
        borderColor: '#fde68a'
      };
    }
    if (percentage >= 70) {
      return {
        title: 'Silver Achiever (Proficient)',
        icon: '🥈',
        color: '#334155',
        bgColor: '#f1f5f9',
        borderColor: '#cbd5e1'
      };
    }
    if (percentage >= 50) {
      return {
        title: 'Bronze Finisher (Passing)',
        icon: '🥉',
        color: '#9a3412',
        bgColor: '#ffedd5',
        borderColor: '#fed7aa'
      };
    }
    return {
      title: 'Revision Recommended',
      icon: '📚',
      color: '#991b1b',
      bgColor: '#fee2e2',
      borderColor: '#fecaca'
    };
  };

  // Format seconds to MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionColors = ['option-red', 'option-blue', 'option-yellow', 'option-green'];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading quiz session...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="alert alert-danger text-center rounded-4 p-4">
        <h5 className="fw-bold mb-2">Quiz Not Found</h5>
        <p className="mb-3">{error || 'Could not find a quiz matching this code.'}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={onBackToList}>
          Back to Quiz Catalog
        </button>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const isPassing = result.percentage >= 50;
    const badge = getAchievementBadge(result.percentage);

    return (
      <div className="card border-0 shadow-sm rounded-4 bg-white">
        <div className="card-body p-4 p-md-5 text-center">
          {/* Printable Header (Visible only when printing) */}
          <div className="d-none print-header">
            <h2 className="fw-bold mb-1">GNOSIS ASSESSMENT SCORECARD</h2>
            <p className="text-muted small">Official Performance Certification</p>
          </div>

          <div className="mb-2">
            <span className="display-4">{badge.icon}</span>
          </div>

          <h2 className="fw-bold text-dark mb-1">Quiz Completed</h2>
          <p className="text-muted mb-3">{result.quizTitle}</p>

          {/* Achievement Award Card */}
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4 border fw-bold small"
            style={{
              backgroundColor: badge.bgColor,
              borderColor: badge.borderColor,
              color: badge.color
            }}
          >
            <span>{badge.icon}</span>
            <span>{badge.title}</span>
          </div>

          {/* Score Box */}
          <div>
            <div
              className="d-inline-block p-4 px-5 rounded-4 mb-4 border"
              style={{
                backgroundColor: isPassing ? '#f0fdf4' : '#fffbeb',
                borderColor: isPassing ? '#bbf7d0' : '#fde68a'
              }}
            >
              <div className="display-4 fw-bold mb-1" style={{ color: isPassing ? '#15803d' : '#b45309' }}>
                {result.score} / {result.totalQuestions}
              </div>
              <div className="fw-semibold fs-5" style={{ color: isPassing ? '#166534' : '#92400e' }}>
                {result.percentage}% &bull; {isPassing ? 'Passed' : 'Needs Practice'}
              </div>
              <div className="small text-muted mt-2">Candidate: <strong>{result.studentName}</strong></div>
            </div>
          </div>

          {/* Action Buttons (Hidden when printing to PDF) */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-5 no-print">
            <button
              className="btn btn-dark px-4 py-2 rounded-3 fw-semibold shadow-sm d-flex align-items-center gap-2"
              onClick={() => window.print()}
            >
              🖨️ Download Scorecard (PDF)
            </button>
            <button className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold" onClick={handleRetake}>
              🔄 Retake Quiz
            </button>
            <button className="btn btn-primary-modern px-4 py-2" onClick={onBackToList}>
              Explore More Quizzes
            </button>
          </div>

          {/* Detailed Question Review */}
          <div className="text-start mt-4 pt-4 border-top">
            <h4 className="fw-bold mb-3">Answer Review</h4>

            <div className="d-flex flex-column gap-3">
              {result.review.map((item, idx) => (
                <div
                  key={idx}
                  className="card border-0 shadow-sm p-3 rounded-3"
                  style={{
                    backgroundColor: item.isCorrect ? '#f8fafc' : '#fff',
                    borderLeft: `4px solid ${item.isCorrect ? '#22c55e' : '#ef4444'}`
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <span className="fw-bold text-dark">
                      Question {item.questionNumber}: {item.questionText}
                    </span>
                    <span
                      className={`badge px-2 py-1 ${
                        item.isCorrect ? 'bg-success' : 'bg-danger'
                      }`}
                    >
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="small mt-1">
                    <div className="text-muted">
                      Your answer:{' '}
                      <strong className={item.isCorrect ? 'text-success' : 'text-danger'}>
                        {item.selectedAnswer}
                      </strong>
                    </div>
                    {!item.isCorrect && (
                      <div className="text-success mt-1">
                        Correct answer: <strong>{item.correctAnswer}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ATTEMPTING VIEW ---
  const currentQuestion = quiz.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);
  const isTimeCritical = timeLeft <= 15;

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white">
      <div className="card-body p-4 p-md-5">
        {/* Top bar with Quizizz PIN Display & Timer */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-light text-muted border px-2 py-1">
                🏷️ {quiz.category || 'General'}
              </span>
              <span className="badge bg-dark text-white px-2 py-1 tracking-wider">
                PIN: {displayCode}
              </span>
            </div>
            <h4 className="fw-bold text-dark mb-0">{quiz.title}</h4>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Live Countdown Timer Badge */}
            <div
              className={`badge px-3 py-2 fs-6 rounded-pill d-flex align-items-center gap-1 ${
                isTimeCritical ? 'timer-pulse text-white' : 'bg-light text-dark border'
              }`}
              title="Time remaining"
            >
              <span>⏱️</span>
              <span className="fw-bold tracking-wider">{formatTimer(timeLeft)}</span>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm rounded-3"
              onClick={handleCopyCode}
              title="Copy 6-digit Join Code"
            >
              {copiedCode ? '✓ PIN' : '📋 PIN'}
            </button>
            <button
              className={`btn btn-sm ${
                copiedLink ? 'btn-success text-white' : 'btn-outline-primary'
              } rounded-3`}
              onClick={handleCopyLink}
            >
              {copiedLink ? '✓ Link' : '🔗 Link'}
            </button>
            <button className="btn btn-outline-danger btn-sm rounded-3" onClick={onBackToList}>
              Exit
            </button>
          </div>
        </div>

        {/* Candidate input */}
        <div className="mb-4 bg-light p-3 rounded-3 border">
          <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
            Candidate / Player Name:
          </label>
          <input
            type="text"
            className="form-control form-control-sm border-0 shadow-none bg-white"
            placeholder="Enter your name to show on leaderboard (optional)"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>

        {/* Progress tracker */}
        <div className="mb-4">
          <div className="d-flex justify-content-between text-muted small fw-semibold mb-2">
            <span>
              Question {currentIndex + 1} of {quiz.questions.length}
            </span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div className="progress" style={{ height: '6px', borderRadius: '4px' }}>
            <div
              className="progress-bar"
              style={{ width: `${progressPercent}%`, backgroundColor: '#4f46e5' }}
            ></div>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="p-4 rounded-3 mb-4 border" style={{ backgroundColor: '#f8fafc' }}>
          <h5 className="fw-bold text-dark mb-0" style={{ lineHeight: 1.4 }}>
            {currentIndex + 1}. {currentQuestion.questionText}
          </h5>
        </div>

        {/* 2x2 COLORFUL KAHOOT / QUIZIZZ-STYLE OPTIONS (2 ON LEFT, 2 ON RIGHT) */}
        <div className="row g-3 mb-5">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = answers[currentIndex] === optIdx;
            const colorClass = optionColors[optIdx % 4];

            return (
              <div key={optIdx} className="col-md-6">
                <div
                  className={`kahoot-option ${colorClass} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(optIdx)}
                >
                  <span className="kahoot-badge">
                    {optionLetters[optIdx] || optIdx + 1}
                  </span>
                  <span className="fw-bold flex-grow-1" style={{ fontSize: '1rem' }}>
                    {option}
                  </span>
                  {isSelected && (
                    <span className="badge bg-dark text-white rounded-pill ms-2 px-2 py-1">
                      ✓ Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="d-flex justify-content-between align-items-center border-top pt-4">
          <button
            className="btn btn-outline-secondary px-3 py-2 rounded-3"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            ← Previous
          </button>

          {currentIndex < quiz.questions.length - 1 ? (
            <button
              className="btn btn-primary-modern px-4 py-2"
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success px-4 py-2 fw-bold rounded-3 shadow-sm"
              disabled={submitting}
              onClick={handleSubmitQuiz}
            >
              {submitting ? 'Submitting...' : 'Complete & Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TakeQuiz;
