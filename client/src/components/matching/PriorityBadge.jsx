import React from 'react';

const PriorityBadge = ({ priority = 'Medium' }) => {
  const norm = String(priority).toLowerCase();

  let bg = '#fef3c7';
  let color = '#d97706';
  let border = '#fde68a';

  if (norm === 'high') {
    bg = '#fee2e2';
    color = '#dc2626';
    border = '#fecaca';
  } else if (norm === 'low') {
    bg = '#f1f5f9';
    color = '#64748b';
    border = '#e2e8f0';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.725rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap'
      }}
    >
      {priority} Priority
    </span>
  );
};

export default PriorityBadge;
