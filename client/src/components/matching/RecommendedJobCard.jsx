import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const RecommendedJobCard = ({
  job,
  onApply = null
}) => {
  if (!job) return null;

  const match = job.match || {
    matchPercentage: 0,
    matchTier: 'Low',
    matchedSkills: [],
    missingSkills: []
  };

  const percentage = match.matchPercentage;
  let badgeBg = '#eff6ff';
  let badgeColor = '#2563eb';
  let badgeBorder = '#bfdbfe';

  if (percentage >= 80) {
    badgeBg = '#f0fdf4';
    badgeColor = '#16a34a';
    badgeBorder = '#bbf7d0';
  } else if (percentage >= 60) {
    badgeBg = '#f0f9ff';
    badgeColor = '#0284c7';
    badgeBorder = '#bae6fd';
  } else if (percentage >= 40) {
    badgeBg = '#fffbeb';
    badgeColor = '#d97706';
    badgeBorder = '#fde68a';
  } else {
    badgeBg = '#f8fafc';
    badgeColor = '#64748b';
    badgeBorder = '#e2e8f0';
  }

  const deadlineFormatted = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Ongoing';

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
        {/* Header: Title, Company, and Match Percentage Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.725rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: 'var(--slate-100, #f1f5f9)',
                color: 'var(--slate-700, #334155)',
                marginBottom: '0.35rem'
              }}
            >
              {job.jobType || 'Internship'} • {job.workMode || 'Remote'}
            </span>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
              <Link to={`/jobs/${job._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {job.title}
              </Link>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--slate-600, #475569)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building2 size={14} /> {job.company}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} /> {job.location}
              </span>
            </div>
          </div>

          {/* Match Ring / Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: badgeBg,
              border: `1.5px solid ${badgeBorder}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: '0.4rem 0.65rem',
              minWidth: '68px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: badgeColor, lineHeight: 1 }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: badgeColor, textTransform: 'uppercase', marginTop: '0.15rem' }}>
              {match.matchTier}
            </span>
          </div>
        </div>

        {/* Skills Summary */}
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
            {match.matchedSkills.slice(0, 3).map((s, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                <CheckCircle2 size={12} /> {s}
              </span>
            ))}
            {match.missingSkills.length > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                <AlertCircle size={12} /> {match.missingSkills.length} to learn
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Deadline & Action Buttons */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--slate-100, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} /> Deadline: {deadlineFormatted}
        </span>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/skill-gap?jobId=${job._id}`}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              color: 'var(--slate-800, #1e293b)',
              textDecoration: 'none'
            }}
          >
            Gap Analysis
          </Link>

          <Link
            to={`/jobs/${job._id}`}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: 'var(--white, #fff)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            View Job <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecommendedJobCard;
