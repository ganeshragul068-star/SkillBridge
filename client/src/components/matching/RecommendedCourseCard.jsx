import React from 'react';
import { BookOpen, Clock, Award, ExternalLink, Sparkles } from 'lucide-react';

const RecommendedCourseCard = ({ course }) => {
  if (!course) return null;

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
        {/* Recommendation reason banner */}
        {course.recommendationReason && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '0.25rem 0.55rem',
              borderRadius: 'var(--radius-sm, 6px)',
              marginBottom: '0.75rem',
              border: '1px solid #bfdbfe'
            }}
          >
            <Sparkles size={13} /> {course.recommendationReason}
          </div>
        )}

        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
          {course.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--slate-600, #475569)', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--navy-800, #1e293b)' }}>
            {course.provider}
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Award size={13} /> {course.difficulty || 'Beginner'}
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} /> {course.duration || 'Self-paced'}
          </span>
        </div>

        <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--slate-600, #475569)', lineHeight: 1.5 }}>
          {course.description}
        </p>

        {/* Skills Covered */}
        {Array.isArray(course.skillsCovered) && course.skillsCovered.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {course.skillsCovered.map((s, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.725rem',
                  backgroundColor: 'var(--slate-100, #f1f5f9)',
                  color: 'var(--slate-700, #334155)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action footer */}
      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100, #f1f5f9)', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={course.courseUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm, 6px)',
            backgroundColor: 'var(--navy-900, #0f172a)',
            color: 'var(--white, #fff)',
            fontSize: '0.825rem',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          <BookOpen size={14} /> Start Learning <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

export default RecommendedCourseCard;
