import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ResultsHistory({ onGoToQuizzes }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5050/api/quizzes/data/results');
      setResults(response.data);
    } catch (err) {
      setError('Failed to load past submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Leaderboard & Submissions</h2>
            <p className="text-muted mb-0">Live audit log of recent quiz attempts and scores.</p>
          </div>
          <button className="btn btn-primary-modern btn-sm" onClick={onGoToQuizzes}>
            Browse Quizzes
          </button>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Retrieving leaderboard data...</p>
          </div>
        )}

        {error && <div className="alert alert-danger rounded-3">{error}</div>}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1 mb-2">📊</div>
            <h5>No attempts recorded yet</h5>
            <p className="small">Take a quiz to see your score on the leaderboard!</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr className="text-muted small text-uppercase" style={{ fontSize: '0.72rem' }}>
                  <th>Rank</th>
                  <th>Candidate</th>
                  <th>Quiz Topic</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, index) => {
                  const isPass = res.percentage >= 50;
                  const rankBadge =
                    index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                  return (
                    <tr key={res._id || index}>
                      <td className="fw-bold">{rankBadge}</td>
                      <td className="fw-semibold text-dark">{res.studentName}</td>
                      <td>{res.quizTitle}</td>
                      <td className="fw-semibold">
                        {res.score} / {res.totalQuestions}
                      </td>
                      <td>{res.percentage}%</td>
                      <td>
                        <span
                          className="badge px-2 py-1 rounded-pill"
                          style={{
                            backgroundColor: isPass ? '#dcfce7' : '#fee2e2',
                            color: isPass ? '#166534' : '#991b1b'
                          }}
                        >
                          {isPass ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {new Date(res.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(res.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsHistory;
