import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import assessmentService from '../services/assessmentService';
import { useToast } from '../hooks/useToast';

const TakeAssessmentPage = () => {
  const { id } = useParams(); // assessmentId or attemptId
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: selectedAnswerIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const initAssessment = async () => {
      try {
        setLoading(true);
        // Start assessment attempt session
        const res = await assessmentService.startAssessment(id);
        if (res?.data) {
          setAttemptData(res.data);
          setQuestions(res.data.questions || []);

          // Calculate remaining seconds from expiresAt
          const expiresTime = new Date(res.data.expiresAt).getTime();
          const now = Date.now();
          const initialSeconds = Math.max(0, Math.floor((expiresTime - now) / 1000));
          setTimeLeft(initialSeconds);
          startTimeRef.current = Date.now();
        }
      } catch (error) {
        showToast(error.message || 'Failed to start assessment attempt', 'error');
        navigate('/assessments');
      } finally {
        setLoading(false);
      }
    };

    initAssessment();
  }, [id]);

  // Countdown Timer Effect
  useEffect(() => {
    if (loading || timeLeft <= 0 || !attemptData) return;

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
  }, [loading, timeLeft, attemptData]);

  const handleSelectOption = (qIdx, optIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleAutoSubmit = () => {
    showToast('Time has expired! Submitting your assessment answers now...', 'warning');
    performSubmit();
  };

  const performSubmit = async () => {
    if (!attemptData || isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Convert answers dictionary to graded payload
      const answersPayload = questions.map((q, idx) => ({
        questionIndex: idx,
        questionId: q._id,
        selectedAnswer: userAnswers[idx] !== undefined ? userAnswers[idx] : -1
      }));

      const res = await assessmentService.submitAssessmentAttempt(attemptData.attemptId, {
        answers: answersPayload,
        timeSpentSeconds
      });

      if (res?.data) {
        showToast('Assessment submitted successfully!', 'success');
        navigate(`/assessments/result/${res.data.resultId}`, {
          state: { resultData: res.data },
          replace: true
        });
      }
    } catch (error) {
      showToast(error.message || 'Error submitting assessment', 'error');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Assessment">
        <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--slate-500, #64748b)' }}>
          <Sparkles size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Initializing secure assessment session...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft < 120; // under 2 minutes

  return (
    <DashboardLayout pageTitle={attemptData?.title || 'Skill Assessment'}>
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Top Control Bar: Assessment Info, Timer, & Submit Button */}
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderLeft: `4px solid ${isUrgent ? '#dc2626' : '#2563eb'}`
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>
              {attemptData?.skill} • Attempt #{attemptData?.attemptNumber || 1}
            </span>
            <h2 style={{ margin: '0.15rem 0', fontSize: '1.25rem', color: 'var(--navy-900, #0f172a)' }}>
              {attemptData?.title}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
              Answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Timer Widget */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: isUrgent ? '#fee2e2' : '#eff6ff',
                color: isUrgent ? '#dc2626' : '#1d4ed8',
                border: `1.5px solid ${isUrgent ? '#fca5a5' : '#bfdbfe'}`,
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              <Clock size={18} className={isUrgent ? 'animate-pulse' : ''} />
              <span>{formattedTime}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Send size={14} /> Submit Assessment
            </button>
          </div>
        </div>

        {/* Main Quiz Layout: Question Card on Left, Question Palette on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 260px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Question Card */}
          {currentQ && (
            <div
              className="card"
              style={{
                padding: '1.75rem',
                borderRadius: 'var(--radius-lg, 12px)'
              }}
            >
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--slate-500, #64748b)',
                    textTransform: 'uppercase'
                  }}
                >
                  Question {currentIdx + 1} of {totalQuestions}
                </span>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'var(--slate-100, #f1f5f9)',
                    color: 'var(--slate-700, #334155)'
                  }}
                >
                  {currentQ.marks || 1} Mark{(currentQ.marks || 1) > 1 ? 's' : ''}
                </span>
              </div>

              {/* Question Text */}
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', color: 'var(--navy-900, #0f172a)', lineHeight: 1.5 }}>
                {currentQ.questionText}
              </h3>

              {/* Multiple Choice Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {(currentQ.options || []).map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIdx] === optIdx;

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectOption(currentIdx, optIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: `1.5px solid ${isSelected ? '#2563eb' : 'var(--slate-200, #e2e8f0)'}`,
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${currentIdx}`}
                        checked={isSelected}
                        onChange={() => handleSelectOption(currentIdx, optIdx)}
                        style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                      />
                      <span style={{ fontSize: '0.925rem', color: isSelected ? '#1e3a8a' : 'var(--slate-800, #1e293b)', fontWeight: isSelected ? 600 : 400 }}>
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Previous / Next Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
                <button
                  type="button"
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  disabled={currentIdx === 0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--slate-100, #f1f5f9)',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentIdx === 0 ? 0.5 : 1
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                {currentIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: 'var(--navy-900, #0f172a)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Review & Submit <Send size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Question Navigation Palette */}
          <div
            className="card"
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg, 12px)'
            }}
          >
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--navy-900, #0f172a)' }}>
              Question Palette
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {questions.map((_, qIdx) => {
                const isAnswered = userAnswers[qIdx] !== undefined;
                const isCurrent = currentIdx === qIdx;

                let btnBg = 'var(--slate-100, #f1f5f9)';
                let btnColor = 'var(--slate-700, #334155)';
                let btnBorder = 'var(--slate-300, #cbd5e1)';

                if (isCurrent) {
                  btnBorder = '2px solid #2563eb';
                }
                if (isAnswered) {
                  btnBg = '#dcfce7';
                  btnColor = '#15803d';
                  btnBorder = '1px solid #86efac';
                }

                return (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => setCurrentIdx(qIdx)}
                    style={{
                      height: '38px',
                      borderRadius: '6px',
                      backgroundColor: btnBg,
                      color: btnColor,
                      border: isCurrent ? '2px solid #2563eb' : btnBorder,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600, #475569)', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#dcfce7', border: '1px solid #86efac' }} />
                <span>Answered ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }} />
                <span>Unanswered ({totalQuestions - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--navy-900, #0f172a)' }}>
              Submit Assessment?
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--slate-600, #475569)', lineHeight: 1.5 }}>
              You have answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions.
              {totalQuestions - answeredCount > 0 && (
                <span style={{ display: 'block', marginTop: '0.5rem', color: '#b45309', fontWeight: 600 }}>
                  ⚠️ You have {totalQuestions - answeredCount} unanswered questions remaining.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: 'var(--slate-100, #f1f5f9)',
                  border: '1px solid var(--slate-300, #cbd5e1)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  performSubmit();
                }}
                disabled={isSubmitting}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSubmitting ? 'Scoring Answers...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TakeAssessmentPage;
