import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const ProgressTracker = ({
  completed = 0,
  total = 0,
  percentage = 0,
  title = 'Roadmap Completion',
  subtitle = 'Progress toward career readiness'
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--white, #fff)',
        border: '1px solid var(--slate-200, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-900, #0f172a)' }}>
            {title}
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
            {subtitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700, #334155)' }}>
            {completed} of {total} Milestones
          </span>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: percentage === 100 ? '#16a34a' : '#2563eb'
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          borderRadius: '5px',
          backgroundColor: 'var(--slate-100, #f1f5f9)',
          overflow: 'hidden',
          marginBottom: '0.75rem'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: percentage === 100 ? '#16a34a' : '#2563eb',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={12} /> {Math.max(0, total - completed)} Steps Remaining
        </span>
        {percentage === 100 ? (
          <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} /> Fully Completed! Ready to Apply
          </span>
        ) : (
          <span>Keep pushing to unlock top employability</span>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
