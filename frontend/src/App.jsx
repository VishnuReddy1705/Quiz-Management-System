import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuizList from './components/QuizList';
import CreateQuiz from './components/CreateQuiz';
import TakeQuiz from './components/TakeQuiz';
import ResultsHistory from './components/ResultsHistory';

function App() {
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' | 'create' | 'take' | 'results'
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Check URL query parameters on page load to allow direct links (?code=102948 or ?quizId=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('quizId');
    if (codeParam) {
      setSelectedQuizId(codeParam);
      setActiveTab('take');
    }
  }, []);

  const handleStartQuiz = (identifier) => {
    setSelectedQuizId(identifier);
    setActiveTab('take');
    // Update URL with clean ?code= parameter like Quizizz
    window.history.pushState({}, '', `?code=${identifier}`);
  };

  const handleBackToList = () => {
    setSelectedQuizId(null);
    setActiveTab('quizzes');
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'take') {
            setSelectedQuizId(null);
            window.history.pushState({}, '', window.location.pathname);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="container flex-grow-1 pb-5">
        {activeTab === 'quizzes' && (
          <QuizList
            onSelectQuiz={handleStartQuiz}
            onGoToCreate={() => setActiveTab('create')}
          />
        )}

        {activeTab === 'create' && (
          <CreateQuiz
            onQuizCreated={(newCode) => {
              if (newCode) {
                handleStartQuiz(newCode);
              } else {
                handleBackToList();
              }
            }}
            onCancel={handleBackToList}
          />
        )}

        {activeTab === 'take' && selectedQuizId && (
          <TakeQuiz
            quizId={selectedQuizId}
            onBackToList={handleBackToList}
          />
        )}

        {activeTab === 'results' && (
          <ResultsHistory onGoToQuizzes={handleBackToList} />
        )}
      </main>
    </div>
  );
}

export default App;
