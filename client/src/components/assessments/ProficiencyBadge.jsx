import React from 'react';
import { Award, ShieldCheck, AlertCircle } from 'lucide-react';

const ProficiencyBadge = ({ level = 'Intermediate', size = 'sm' }) => {
  const norm = String(level).toLowerCase();

  let bg = '#eff6ff';
  let color = '#2563eb';
  let border = '#bfdbfe';
  let icon = <Award size={size === 'lg' ? 16 : 13} />;

  if (norm.includes('expert')) {
    bg = '#ecfdf5';
    color = '#059669';
    border = '#a7f3d0';
    icon = <ShieldCheck size={size === 'lg' ? 16 : 13} />;
  } else if (norm.includes('advanced')) {
    bg = '#f5f3ff';
    color = '#7c3aed';
    border = '#ddd6fe';
    icon = <Award size={size === 'lg' ? 16 : 13} />;
  } else if (norm.includes('intermediate')) {
    bg = '#eff6ff';
    color = '#2563eb';
    border = '#bfdbfe';
  } else if (norm.includes('beginner')) {
    bg = '#fffbeb';
    color = '#d97706';
    border = '#fde68a';
  } else {
    // Needs Improvement
    bg = '#fee2e2';
    color = '#dc2626';
    border = '#fecaca';
    icon = <AlertCircle size={size === 'lg' ? 16 : 13} />;
  }

  const padding = size === 'lg' ? '0.35rem 0.85rem' : '0.2rem 0.55rem';
  const fontSize = size === 'lg' ? '0.85rem' : '0.725rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding,
        borderRadius: '9999px',
        fontSize,
        fontWeight: 600,
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap'
      }}
    >
      {icon} {level}
    </span>
  );
};

export default ProficiencyBadge;
