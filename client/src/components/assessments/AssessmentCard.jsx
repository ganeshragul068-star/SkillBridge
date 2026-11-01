import React from 'react';
import { Award, Clock, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

const AssessmentCard = ({ assessment, onStart }) => {
  if (!assessment) return null;

  const difficultyColors = {
    Beginner: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    Intermediate: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    Advanced: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' }
  };

  const diffStyle = difficultyColors[assessment.difficulty] || difficultyColors.Intermediate;

  return (
    <div
      style={{
        backgroundColor: 'var(--white, #fff)',
        border: '1px solid var(--slate-200, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div>
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              color: 'var(--slate-700, #334155)',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}
          >
            {assessment.skill}
          </span>

          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 600,
              backgroundColor: diffStyle.bg,
              color: diffStyle.color,
              border: `1px solid ${diffStyle.border}`,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px'
            }}
          >
            {assessment.difficulty}
          </span>
        </div>

        {/* Title & Description */}
        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)', lineHeight: 1.35 }}>
          {assessment.title}
        </h3>

        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--slate-600, #475569)', lineHeight: 1.5 }}>
          {assessment.description}
        </p>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--slate-50, #f8fafc)',
            borderRadius: 'var(--radius-sm, 6px)',
            fontSize: '0.8rem',
            color: 'var(--slate-700, #334155)',
            marginBottom: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <HelpCircle size={14} color="#64748b" />
            <span><strong>{assessment.totalQuestions}</strong> Questions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} color="#64748b" />
            <span><strong>{assessment.duration}</strong> Mins</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={14} color="#64748b" />
            <span><strong>{assessment.totalMarks}</strong> Total Marks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle size={14} color="#16a34a" />
            <span>Pass: <strong>{assessment.passingScore}%</strong></span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
        <button
          type="button"
          onClick={() => onStart && onStart(assessment)}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-sm, 6px)',
            backgroundColor: 'var(--navy-900, #0f172a)',
            color: 'var(--white, #fff)',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Start Assessment <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;
