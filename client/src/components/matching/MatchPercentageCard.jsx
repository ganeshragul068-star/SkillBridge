import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const MatchPercentageCard = ({
  percentage = 0,
  tier = 'Moderate',
  matchedCount = 0,
  totalRequired = 0,
  title = 'Skill Match Score',
  subtitle = 'Calculated against required job skills'
}) => {
  let color = '#2563eb';
  let bgColor = '#eff6ff';
  let borderColor = '#bfdbfe';

  if (percentage >= 80) {
    color = '#16a34a';
    bgColor = '#f0fdf4';
    borderColor = '#bbf7d0';
  } else if (percentage >= 60) {
    color = '#0284c7';
    bgColor = '#f0f9ff';
    borderColor = '#bae6fd';
  } else if (percentage >= 40) {
    color = '#d97706';
    bgColor = '#fffbeb';
    borderColor = '#fde68a';
  } else {
    color = '#64748b';
    bgColor = '#f8fafc';
    borderColor = '#e2e8f0';
  }

  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}
    >
      <div style={{ flex: '1 1 240px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Sparkles size={18} color={color} />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900, #0f172a)' }}>
            {title}
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-600, #475569)' }}>
          {subtitle}
        </p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.825rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-700, #334155)' }}>
            <CheckCircle2 size={15} color="#16a34a" /> {matchedCount} Matched
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--slate-700, #334155)' }}>
            <AlertCircle size={15} color="#d97706" /> {Math.max(0, totalRequired - matchedCount)} Missing
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color, letterSpacing: '0.05em' }}>
            {tier} Match
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
            {matchedCount} of {totalRequired} skills
          </div>
        </div>
        <div
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            backgroundColor: 'var(--white, #fff)',
            border: `4px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color, lineHeight: 1 }}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchPercentageCard;
