import React from 'react';
import { Check, X, Award } from 'lucide-react';

const SkillGapChart = ({
  matchedSkills = [],
  missingSkills = [],
  percentage = 0
}) => {
  const total = matchedSkills.length + missingSkills.length;

  return (
    <div
      style={{
        backgroundColor: 'var(--white, #fff)',
        border: '1px solid var(--slate-200, #e2e8f0)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--navy-900, #0f172a)' }}>
          Requirement Coverage Breakdown
        </h4>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: percentage >= 70 ? '#16a34a' : '#2563eb' }}>
          {percentage}% Satisfied
        </span>
      </div>

      {/* Stacked bar visualization */}
      <div
        style={{
          width: '100%',
          height: '14px',
          borderRadius: '7px',
          backgroundColor: '#fee2e2',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '1rem'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: percentage >= 80 ? '#16a34a' : percentage >= 60 ? '#0284c7' : '#d97706',
            transition: 'width 0.4s ease'
          }}
          title={`${percentage}% matched`}
        />
      </div>

      {/* Skills Matrix Table */}
      <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left', color: 'var(--slate-500, #64748b)' }}>
              <th style={{ padding: '0.4rem 0', fontWeight: 600 }}>Skill</th>
              <th style={{ padding: '0.4rem 0', fontWeight: 600, textAlign: 'center' }}>Status</th>
              <th style={{ padding: '0.4rem 0', fontWeight: 600, textAlign: 'right' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {matchedSkills.map((s, idx) => {
              const name = typeof s === 'string' ? s : s.name;
              const isVerified = typeof s === 'object' && s.isVerified;
              return (
                <tr key={`m-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0', fontWeight: 500, color: 'var(--navy-900, #0f172a)' }}>
                    {name}
                  </td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: '#16a34a',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      <Check size={14} /> Acquired
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                    {isVerified ? (
                      <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.725rem', fontWeight: 600 }}>
                        <Award size={12} /> Verified
                      </span>
                    ) : (
                      <span style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.725rem' }}>
                        Profile Skill
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {missingSkills.map((s, idx) => {
              const name = typeof s === 'string' ? s : s.name;
              const priority = typeof s === 'object' ? s.priority : 'Medium';
              return (
                <tr key={`miss-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0', fontWeight: 500, color: 'var(--navy-900, #0f172a)' }}>
                    {name}
                  </td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      <X size={14} /> Gap
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                    <span style={{ color: priority === 'High' ? '#dc2626' : '#d97706', fontSize: '0.725rem', fontWeight: 600 }}>
                      {priority} Priority
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkillGapChart;
