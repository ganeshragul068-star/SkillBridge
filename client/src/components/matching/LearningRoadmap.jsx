import React from 'react';
import { CheckCircle, Circle, Clock, Trash2, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const LearningRoadmap = ({
  steps = [],
  onUpdateStatus,
  onDeleteStep
}) => {
  if (!steps || steps.length === 0) {
    return (
      <div
        style={{
          padding: '2.5rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--white, #fff)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--slate-200, #e2e8f0)'
        }}
      >
        <p style={{ color: 'var(--slate-600, #475569)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
          No learning steps in your roadmap yet.
        </p>
        <span style={{ fontSize: '0.825rem', color: 'var(--slate-400, #94a3b8)' }}>
          Select a target career role or job to generate your personalized learning path.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed' || step.progressPercentage === 100;
        const isInProgress = step.status === 'in-progress' && !isCompleted;

        return (
          <div
            key={step._id || index}
            style={{
              backgroundColor: 'var(--white, #fff)',
              border: `1.5px solid ${isCompleted ? '#bbf7d0' : isInProgress ? '#bfdbfe' : 'var(--slate-200, #e2e8f0)'}`,
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative'
            }}
          >
            {/* Top row: Step number, skill title, priority, status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#16a34a' : isInProgress ? '#2563eb' : 'var(--slate-100, #f1f5f9)',
                    color: isCompleted || isInProgress ? '#ffffff' : 'var(--slate-700, #334155)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  {isCompleted ? <CheckCircle size={20} /> : step.stepNumber || index + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
                      {step.skill}
                    </h3>
                    <PriorityBadge priority={step.priority} />
                    {step.isFoundational && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: '#f5f3ff',
                          color: '#7c3aed',
                          border: '1px solid #ddd6fe',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <ShieldCheck size={11} /> Foundational
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
                    Target Role: {step.targetRole || 'Full Stack MERN Developer'}
                  </span>
                </div>
              </div>

              {/* Status toggle & delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={step.status || 'not-started'}
                  onChange={(e) => onUpdateStatus && onUpdateStatus(step._id, e.target.value)}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    backgroundColor: isCompleted ? '#f0fdf4' : isInProgress ? '#eff6ff' : '#f8fafc',
                    color: isCompleted ? '#16a34a' : isInProgress ? '#2563eb' : 'var(--slate-700, #334155)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="not-started">⚪ Not Started</option>
                  <option value="in-progress">🔵 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                </select>

                {onDeleteStep && (
                  <button
                    type="button"
                    onClick={() => onDeleteStep(step._id)}
                    title="Remove step"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--slate-400, #94a3b8)',
                      cursor: 'pointer',
                      padding: '0.35rem',
                      borderRadius: '4px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Attached Recommended Courses */}
            {Array.isArray(step.recommendedCourses) && step.recommendedCourses.length > 0 && (
              <div style={{ marginTop: '0.35rem', paddingTop: '0.65rem', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600, #475569)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Curated Courses for {step.skill}:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {step.recommendedCourses.map((c, cIdx) => (
                    <div
                      key={c._id || cIdx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem',
                        backgroundColor: '#f8fafc',
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <span style={{ fontWeight: 500, color: 'var(--navy-900, #0f172a)' }}>
                        <BookOpen size={13} style={{ display: 'inline', marginRight: '0.35rem' }} />
                        {c.title} <span style={{ color: 'var(--slate-500, #64748b)', fontSize: '0.75rem' }}>({c.provider})</span>
                      </span>
                      {c.courseUrl && (
                        <a
                          href={c.courseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#2563eb',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          Learn <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LearningRoadmap;
