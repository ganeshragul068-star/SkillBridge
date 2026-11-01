import React from 'react';
import { AlertCircle, BookOpen, PlusCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const MissingSkillsList = ({
  missingSkills = [],
  onAddToRoadmap = null,
  onViewCourses = null
}) => {
  if (!missingSkills || missingSkills.length === 0) {
    return (
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#f0fdf4',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span>🎉 You have satisfied all required skills for this target!</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {missingSkills.map((skillItem, idx) => {
        const skillName = typeof skillItem === 'string' ? skillItem : skillItem.name;
        const priority = typeof skillItem === 'object' ? skillItem.priority : 'Medium';
        const reason = typeof skillItem === 'object' ? skillItem.reason : '';

        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: '#fff',
              border: '1px solid var(--slate-200, #e2e8f0)',
              borderRadius: 'var(--radius-md, 8px)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={18} color="#d97706" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--navy-900, #0f172a)' }}>
                    {skillName}
                  </span>
                  <PriorityBadge priority={priority} />
                </div>
                {reason && (
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.775rem', color: 'var(--slate-500, #64748b)' }}>
                    {reason}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onViewCourses && (
                <button
                  type="button"
                  onClick={() => onViewCourses(skillName)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--navy-50, #f8fafc)',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    color: 'var(--navy-800, #1e293b)',
                    cursor: 'pointer'
                  }}
                >
                  <BookOpen size={13} /> View Courses
                </button>
              )}
              {onAddToRoadmap && (
                <button
                  type="button"
                  onClick={() => onAddToRoadmap(skillName, priority)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    cursor: 'pointer'
                  }}
                >
                  <PlusCircle size={13} /> Add to Roadmap
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MissingSkillsList;
