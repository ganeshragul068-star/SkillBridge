import React from 'react';
import { CheckCircle2, Award } from 'lucide-react';

const MatchedSkillsList = ({ matchedSkills = [] }) => {
  if (!matchedSkills || matchedSkills.length === 0) {
    return (
      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--slate-500, #64748b)', fontSize: '0.9rem' }}>
        No matching skills currently in your profile for this target.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
      {matchedSkills.map((skillItem, idx) => {
        const skillName = typeof skillItem === 'string' ? skillItem : skillItem.name;
        const isVerified = typeof skillItem === 'object' && skillItem.isVerified;

        return (
          <div
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: isVerified ? '#ecfdf5' : '#f0fdf4',
              border: `1px solid ${isVerified ? '#a7f3d0' : '#bbf7d0'}`,
              color: '#15803d',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{skillName}</span>
            {isVerified && (
              <span
                title="Verified via SkillBridge Assessment"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.7rem',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                <Award size={11} /> Verified
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MatchedSkillsList;
