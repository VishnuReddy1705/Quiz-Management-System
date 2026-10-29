import React from 'react';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="custom-navbar py-3 mb-4 shadow-sm">
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
        {/* Brand / Logo */}
        <div
          className="d-flex align-items-center gap-2 cursor-pointer"
          style={{ cursor: 'pointer' }}
          onClick={() => setActiveTab('quizzes')}
        >
          <div className="brand-logo-icon">Γ</div>
          <div>
            <div className="fw-bold text-white fs-5 lh-1 tracking-tight">GNOSIS</div>
            <small style={{ color: '#94a3b8', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              QUIZ & KNOWLEDGE ENGINE
            </small>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex align-items-center gap-2">
          <button
            className={`nav-pill-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            Explore Quizzes
          </button>

          <button
            className={`nav-pill-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            + Create Quiz
          </button>

          <button
            className={`nav-pill-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Leaderboard
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
