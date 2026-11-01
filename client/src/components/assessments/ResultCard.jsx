import React from 'react';
import { Award, CheckCircle2, XCircle, Clock, RotateCcw, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProficiencyBadge from './ProficiencyBadge';

const ResultCard = ({ result, onRetake, onScrollToReview }) => {
  if (!result) return null;

  const passed = result.passed;
  const percentage = result.percentage;
  const timeFormatted = result.timeSpentSeconds
    ? `${Math.floor(result.timeSpentSeconds / 60)}m ${result.timeSpentSeconds % 60}s`
    : 'Completed';

  return (
    <div
      style={{
        backgroundColor: 'var(--white, #fff)',
        border: `2px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                backgroundColor: passed ? '#dcfce7' : '#fee2e2',
                color: passed ? '#15803d' : '#dc2626'
              }}
            >
              {passed ? 'Passed — Verified Competency' : 'Needs Retest — Pass Score Not Met'}
            </span>
            <ProficiencyBadge level={result.proficiencyLevel} size="lg" />
          </div>

          <h2 style={{ margin: '0 0 0.4rem 0', fontSize: '1.6rem', color: 'var(--navy-900, #0f172a)' }}>
            {result.title || result.assessmentTitle || 'Assessment Results'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--slate-600, #475569)', maxWidth: '580px', lineHeight: 1.5 }}>
            {result.feedback}
          </p>
        </div>

        {/* Circular Percentage Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: passed ? '#f0fdf4' : '#fef2f2',
              border: `5px solid ${passed ? '#16a34a' : '#dc2626'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)'
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: passed ? '#16a34a' : '#dc2626', lineHeight: 1 }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>
              Score
            </span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--slate-100, #f1f5f9)'
        }}
      >
        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md, 8px)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Score Obtained</span>
          <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', color: 'var(--navy-900, #0f172a)' }}>
            {result.score} / {result.totalMarks}
          </h4>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '0.85rem', borderRadius: 'var(--radius-md, 8px)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Correct Answers</span>
          <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', color: '#15803d' }}>
            {result.correctCount !== undefined ? result.correctCount : '—'}
          </h4>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '0.85rem', borderRadius: 'var(--radius-md, 8px)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Incorrect Answers</span>
          <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', color: '#b91c1c' }}>
            {result.incorrectCount !== undefined ? result.incorrectCount : '—'}
          </h4>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md, 8px)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Time Invested</span>
          <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', color: 'var(--navy-900, #0f172a)' }}>
            {timeFormatted}
          </h4>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md, 8px)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Attempt #</span>
          <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', color: 'var(--navy-900, #0f172a)' }}>
            {result.attemptNumber || 1}
          </h4>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--slate-100, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onScrollToReview && (
            <button
              type="button"
              onClick={onScrollToReview}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--slate-100, #f1f5f9)',
                border: '1px solid var(--slate-300, #cbd5e1)',
                cursor: 'pointer'
              }}
            >
              Review Question Explanations ↓
            </button>
          )}

          {onRetake && (
            <button
              type="button"
              onClick={onRetake}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> Retake Assessment
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/assessments"
            style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              color: 'var(--slate-700, #334155)',
              textDecoration: 'none'
            }}
          >
            All Assessments
          </Link>
          <Link
            to="/skill-gap"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            Check Skill Gap Matrix <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
