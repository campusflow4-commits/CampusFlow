import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Coins, 
  Sparkles, 
  RotateCcw, 
  Clock 
} from 'lucide-react';

export const QuizPage = () => {
  const { refreshUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: 2, 1: 1, ... }
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const data = await api.get('/quiz');
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const startQuiz = async (quizId) => {
    try {
      const fullQuiz = await api.get(`/quiz/${quizId}`);
      setActiveQuiz(fullQuiz);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setQuizResult(null);
    } catch (err) {
      alert('Failed to load quiz questions.');
    }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      // Build answers array indexed by question index
      const answersArray = activeQuiz.questions.map((_, i) => selectedAnswers[i] ?? null);
      const res = await api.post(`/quiz/${activeQuiz._id}/submit`, { answers: answersArray });
      setQuizResult(res);
      await refreshUser();
      await fetchQuizzes();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
          <Award size={15} /> Knowledge Assessments
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Skill <span className="text-gradient">Quizzes</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '650px' }}>
          Validate your technical knowledge before swapping skills. Pass quizzes with 60%+ to earn <strong style={{ color: '#fcd34d' }}>+25 credits</strong>!
        </p>
      </div>

      {!activeQuiz ? (
        /* Quiz Selection Grid */
        <div className="grid-2">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span className="badge badge-primary">{quiz.category}</span>
                {quiz.isPassed ? (
                  <span className="badge badge-emerald">
                    <CheckCircle2 size={13} /> Passed (+25 Credits Earned)
                  </span>
                ) : (
                  <span className="badge badge-amber">
                    <Coins size={13} /> Reward: {quiz.creditReward} Credits
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{quiz.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', flex: 1 }}>
                {quiz.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '20px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '12px'
              }}>
                <span>Questions: {quiz.totalQuestions}</span>
                <span>Time Limit: {quiz.timeLimitMinutes} min</span>
                <span>Passing: 60%</span>
              </div>

              <button
                onClick={() => startQuiz(quiz._id)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {quiz.isPassed ? 'Retake Quiz' : 'Start Assessment'} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : quizResult ? (
        /* Quiz Results Screen */
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              background: quizResult.passed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
              color: quizResult.passed ? '#10b981' : '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {quizResult.passed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {quizResult.passed ? '🎉 Congratulations, You Passed!' : 'Almost There! Keep Practicing'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              You scored {quizResult.score} out of {quizResult.totalQuestions} ({quizResult.percentage}%)
            </p>

            {quizResult.creditsEarned > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fcd34d',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                marginTop: '16px'
              }}>
                <Sparkles size={18} /> +{quizResult.creditsEarned} Credits Added to Your Account!
              </div>
            )}
          </div>

          {/* Detailed Question Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Question Breakdown:</h4>
            {quizResult.breakdown.map((item, idx) => (
              <div key={idx} style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: item.isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
                border: `1px solid ${item.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`
              }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                  Q{idx + 1}. {item.questionText}
                </p>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ color: item.isCorrect ? '#6ee7b7' : '#fb7185' }}>
                    Your Answer: {item.userAnswer} {item.isCorrect ? '✓' : '✗'}
                  </p>
                  {!item.isCorrect && (
                    <p style={{ color: '#6ee7b7' }}>Correct Answer: {item.correctAnswer}</p>
                  )}
                  {item.explanation && (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                      💡 {item.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveQuiz(null)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => startQuiz(activeQuiz._id)}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <RotateCcw size={16} /> Retake Quiz
            </button>
          </div>
        </div>
      ) : (
        /* Question Answering View */
        <div className="glass-card" style={{ maxWidth: '720px', margin: '0 auto', padding: '36px' }}>
          {/* Progress & Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span className="badge badge-primary">{activeQuiz.category}</span>
              <h3 style={{ fontSize: '1.2rem', marginTop: '6px' }}>{activeQuiz.title}</h3>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
            </span>
          </div>

          {/* Question Text */}
          <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5 }}>
              {activeQuiz.questions[currentQuestionIdx].questionText}
            </h4>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestionIdx, optIdx)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-input)',
                    border: `1.5px solid ${isSelected ? '#6366f1' : 'var(--border-color)'}`,
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? '#6366f1' : '#64748b'}`,
                    background: isSelected ? '#6366f1' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="btn btn-primary btn-sm"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="btn btn-emerald"
              >
                {submitting ? 'Evaluating...' : <><CheckCircle2 size={16} /> Submit Quiz & Calculate Score</>}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
