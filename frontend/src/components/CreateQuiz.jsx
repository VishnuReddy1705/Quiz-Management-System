import React, { useState } from 'react';
import axios from 'axios';

function CreateQuiz({ onQuizCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [customCategory, setCustomCategory] = useState('');
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdQuizInfo, setCreatedQuizInfo] = useState(null); // { id, code, shareUrl }
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctAnswerIndex = optIndex;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0
      }
    ]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length === 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleCopyCode = () => {
    if (!createdQuizInfo) return;
    navigator.clipboard.writeText(createdQuizInfo.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    if (!createdQuizInfo) return;
    navigator.clipboard.writeText(createdQuizInfo.shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a Quiz Title.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim() ? customCategory.trim() : category;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question #${i + 1} is missing its question statement.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${optionLetters[j]} in Question #${i + 1} cannot be empty.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/quizzes', {
        title: title.trim(),
        description: description.trim(),
        category: finalCategory,
        questions
      });

      const quizData = response.data?.quiz;
      const code = quizData?.quizCode || quizData?._id;
      const shareUrl = `${window.location.origin}${window.location.pathname}?code=${code}`;

      setCreatedQuizInfo({
        id: quizData?._id,
        code,
        shareUrl
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Quizizz-Style Success Dialog
  if (createdQuizInfo) {
    return (
      <div className="card border-0 shadow-sm rounded-4 bg-white text-center p-4 p-md-5">
        <div className="fs-1 mb-2">🎉</div>
        <h2 className="fw-bold text-dark mb-1">Your Quiz is Live!</h2>
        <p className="text-muted mb-4">
          Students can join either by entering this 6-digit Join Code or by using the direct link:
        </p>

        {/* Big Quizizz PIN Display */}
        <div
          className="d-inline-block p-4 px-5 rounded-4 mb-4 border"
          style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}
        >
          <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            STUDENT GAME PIN / JOIN CODE
          </small>
          <div className="display-4 fw-bold text-primary tracking-widest my-2">
            {createdQuizInfo.code}
          </div>
          <button
            className={`btn btn-sm ${copiedCode ? 'btn-success text-white' : 'btn-outline-dark'} rounded-3 px-3`}
            onClick={handleCopyCode}
          >
            {copiedCode ? '✓ PIN Copied!' : '📋 Copy Join Code'}
          </button>
        </div>

        {/* Shareable Link Input */}
        <div className="card bg-light border p-3 rounded-3 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
          <label className="text-muted small fw-semibold d-block text-start mb-1">Direct Game Link:</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-white"
              readOnly
              value={createdQuizInfo.shareUrl}
            />
            <button
              className={`btn ${copiedLink ? 'btn-success text-white' : 'btn-dark'}`}
              onClick={handleCopyLink}
            >
              {copiedLink ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-3">
          <button
            className="btn btn-outline-secondary px-4 py-2 rounded-3"
            onClick={() => onQuizCreated(null)}
          >
            ← Back to Quiz Catalog
          </button>
          <button
            className="btn btn-primary-modern px-4 py-2"
            onClick={() => onQuizCreated(createdQuizInfo.code)}
          >
            Play Quiz Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Create New Quiz</h2>
            <p className="text-muted mb-0">Define quiz metadata, categorize it, and add questions.</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={onCancel}>
            Cancel
          </button>
        </div>

        {error && <div className="alert alert-danger rounded-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Metadata */}
          <div className="row g-3 mb-4">
            <div className="col-md-7">
              <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                Quiz Title *
              </label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="e.g. Asynchronous JavaScript & Promises"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="col-md-5">
              <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                Category *
              </label>
              <select
                className="form-select rounded-3"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="Databases">Databases</option>
                <option value="Science">Science</option>
                <option value="General">General</option>
                <option value="Other">Custom Category...</option>
              </select>
            </div>

            {category === 'Other' && (
              <div className="col-12">
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Enter custom category name..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="col-12">
              <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '0.72rem' }}>
                Description
              </label>
              <textarea
                className="form-control rounded-3"
                rows="2"
                placeholder="Brief summary of what this quiz covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* Questions */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Questions ({questions.length})</h5>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-3"
                onClick={addQuestion}
              >
                + Add Another Question
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="card border rounded-3 p-4 mb-4" style={{ backgroundColor: '#fcfcfd' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-primary">Question {qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm rounded-2 py-0 px-2"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder={`Enter question statement #${qIndex + 1}...`}
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    required
                  />
                </div>

                <small className="text-muted fw-bold d-block mb-2 text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Options (Select radio of the correct choice):
                </small>

                <div className="row g-2">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <input
                            className="form-check-input mt-0"
                            type="radio"
                            name={`correct-answer-${qIndex}`}
                            checked={q.correctAnswerIndex === optIndex}
                            onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
                            title="Mark as correct"
                          />
                          <span className="ms-2 fw-bold text-muted small">{optionLetters[optIndex]}</span>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Option ${optionLetters[optIndex]}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 border-top pt-4">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 py-2 rounded-3"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-modern px-4 py-2"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Publish Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuiz;
