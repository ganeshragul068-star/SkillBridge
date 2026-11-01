import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, BookOpen } from 'lucide-react';

const QuestionReview = ({ answers = [] }) => {
  if (!answers || answers.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500, #64748b)' }}>
        No question review data available.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--navy-900, #0f172a)' }}>
        Question-by-Question Review & Explanations
      </h3>

      {answers.map((ans, idx) => {
        const isCorrect = ans.isCorrect;
        const selected = ans.selectedAnswer;
        const correct = ans.correctAnswer;
        const options = ans.options || [];

        return (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--white, #fff)',
              border: `1.5px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.25rem'
            }}
          >
            {/* Header: Question Number & Pass/Fail Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                    color: isCorrect ? '#16a34a' : '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--navy-900, #0f172a)', fontSize: '0.95rem' }}>
                  {ans.questionText || `Question #${idx + 1}`}
                </span>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: isCorrect ? '#15803d' : '#dc2626'
                }}
              >
                {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {isCorrect ? 'Correct (+1 Mark)' : 'Incorrect (0 Marks)'}
              </span>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {options.map((opt, optIdx) => {
                const isSelected = selected === optIdx;
                const isTheCorrectOption = correct === optIdx;

                let optBg = '#f8fafc';
                let optBorder = '#e2e8f0';
                let optColor = 'var(--slate-700, #334155)';

                if (isTheCorrectOption) {
                  optBg = '#f0fdf4';
                  optBorder = '#86efac';
                  optColor = '#15803d';
                } else if (isSelected && !isTheCorrectOption) {
                  optBg = '#fef2f2';
                  optBorder = '#fca5a5';
                  optColor = '#b91c1c';
                }

                return (
                  <div
                    key={optIdx}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor: optBg,
                      border: `1.5px solid ${optBorder}`,
                      color: optColor,
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                    </span>

                    {isTheCorrectOption && (
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#16a34a' }}>
                        ✓ Correct Answer
                      </span>
                    )}
                    {isSelected && !isTheCorrectOption && (
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#dc2626' }}>
                        ✗ Your Selection
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation box */}
            {ans.explanation && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.825rem',
                  color: 'var(--slate-600, #475569)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}
              >
                <BookOpen size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--navy-900, #0f172a)' }}>Explanation:</strong> {ans.explanation}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuestionReview;
