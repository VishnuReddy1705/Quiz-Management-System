import React, { useState, useEffect } from 'react';
import axios from 'axios';

function QuizList({ onSelectQuiz, onGoToCreate }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Fetch quizzes from backend
  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5050/api/quizzes');
      setQuizzes(response.data);
    } catch (err) {
      setError('Unable to reach backend server. Make sure node server.js is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Delete quiz
  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await axios.delete(`http://localhost:5050/api/quizzes/${id}`);
        setQuizzes(quizzes.filter(q => q._id !== id));
      } catch (err) {
        alert('Failed to delete quiz.');
      }
    }
  };

  // Copy 6-digit join code
  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Copy shareable link
  const handleCopyLink = (e, code) => {
    e.stopPropagation();
    const shareableUrl = `${window.location.origin}${window.location.pathname}?code=${code}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Handle Quizizz-style Join Code Submit
  const handleJoinByCode = (e) => {
    e.preventDefault();
    const input = joinCodeInput.trim();
    if (!input) return;

    let targetCode = input;
    // If student pasted a full link like http://.../?code=102948, extract the code
    if (targetCode.includes('code=')) {
      const match = targetCode.match(/code=([^&]+)/);
      if (match) targetCode = match[1];
    } else if (targetCode.includes('quizId=')) {
      const match = targetCode.match(/quizId=([^&]+)/);
      if (match) targetCode = match[1];
    }

    onSelectQuiz(targetCode);
  };

  // Extract unique categories
  const categories = ['All', ...new Set(quizzes.map(q => q.category || 'General'))];

  // Simple category filter logic
  const filteredQuizzes =
    selectedCategory === 'All'
      ? quizzes
      : quizzes.filter(quiz => (quiz.category || 'General') === selectedCategory);

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0);

  return (
    <div>
      {/* Quizizz-Style Join Game Hero Banner */}
      <div
        className="card border-0 text-white p-4 p-md-5 mb-4 rounded-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)'
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span
              className="badge px-3 py-1 mb-2 fw-semibold text-uppercase"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              🎮 Quizizz-Style Assessment Mode
            </span>
            <h1 className="fw-bold display-6 mb-2">Have a Quiz Code?</h1>
            <p className="text-white-50 mb-0">
              Enter the 6-digit PIN given by your teacher to jump straight into the live quiz!
            </p>
          </div>

          <div className="col-lg-5">
            <form onSubmit={handleJoinByCode} className="d-flex flex-column gap-2 bg-white p-3 rounded-4 shadow">
              <label className="text-dark fw-bold small text-uppercase" style={{ fontSize: '0.72rem' }}>
                Enter 6-Digit Join PIN:
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control form-control-lg fw-bold text-center tracking-wider"
                  placeholder="e.g. 102948"
                  maxLength={10}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  style={{ letterSpacing: '2px', fontSize: '1.25rem' }}
                />
                <button type="submit" className="btn btn-primary-modern px-4 fw-bold">
                  Join →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold tracking-tight mb-1" style={{ fontSize: '1.75rem' }}>
            All Quizzes
          </h2>
          <p className="text-muted mb-0">Select a quiz to play or share its 6-digit Join Code with students.</p>
        </div>

        <button className="btn btn-primary-modern shadow-sm" onClick={onGoToCreate}>
          + Create New Quiz
        </button>
      </div>

      {/* Category Filter Section */}
      <div className="card border-0 shadow-sm p-3 mb-4 rounded-4 bg-white">
        <small className="text-muted fw-bold d-block mb-2 text-uppercase" style={{ fontSize: '0.72rem' }}>
          Filter by Category:
        </small>
        <div className="d-flex flex-wrap gap-2">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? quizzes.length
                : quizzes.filter(q => (q.category || 'General') === cat).length;

            return (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading quizzes...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center rounded-3">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchQuizzes}>
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredQuizzes.length === 0 && (
        <div className="card modern-card text-center py-5 p-4">
          <div className="card-body">
            <div className="fs-1 mb-2">📂</div>
            <h5 className="fw-bold text-dark">No Quizzes in this Category</h5>
            <p className="text-muted mb-3">There are no quizzes created under "{selectedCategory}" yet.</p>
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => setSelectedCategory('All')}
            >
              View All Quizzes
            </button>
            <button className="btn btn-primary-modern" onClick={onGoToCreate}>
              Create Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      <div className="row g-4">
        {filteredQuizzes.map((quiz) => {
          const displayCode = quiz.quizCode || quiz._id;

          return (
            <div key={quiz._id} className="col-md-6 col-lg-4">
              <div className="card modern-card h-100 d-flex flex-column">
                <div className="card-body p-4 d-flex flex-column">
                  {/* Top row: Category & Question count */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge border fw-semibold px-2 py-1"
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        borderColor: '#e2e8f0',
                        fontSize: '0.75rem'
                      }}
                    >
                      🏷️ {quiz.category || 'General'}
                    </span>
                    <span
                      className="badge rounded-pill fw-semibold"
                      style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}
                    >
                      {quiz.questionCount || 0} Questions
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h5 className="card-title fw-bold text-dark mb-2" style={{ lineHeight: 1.3 }}>
                    {quiz.title}
                  </h5>
                  <p className="card-text text-muted small flex-grow-1 mb-3" style={{ lineHeight: 1.5 }}>
                    {quiz.description || 'Test your knowledge on this topic.'}
                  </p>

                  {/* Quizizz Code Highlight Box */}
                  <div
                    className="p-2 px-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border"
                    style={{ backgroundColor: '#f8fafc' }}
                  >
                    <div>
                      <small className="text-muted fw-bold d-block" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                        JOIN PIN / CODE
                      </small>
                      <span className="fw-bold fs-6 text-dark tracking-wider">
                        {displayCode}
                      </span>
                    </div>

                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                        title="Copy 6-digit Join Code"
                        onClick={(e) => handleCopyCode(e, displayCode)}
                      >
                        {copiedCode === displayCode ? '✓ Copied' : '📋 Code'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        style={{ fontSize: '0.78rem' }}
                        title="Copy direct link"
                        onClick={(e) => handleCopyLink(e, displayCode)}
                      >
                        {copiedLink === displayCode ? '✓ Link' : '🔗 Link'}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                    <button
                      className="btn btn-primary-modern w-100 me-2"
                      onClick={() => onSelectQuiz(displayCode)}
                    >
                      Play Quiz →
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm px-2 py-2"
                      title="Delete Quiz"
                      onClick={(e) => handleDelete(e, quiz._id, quiz.title)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuizList;
