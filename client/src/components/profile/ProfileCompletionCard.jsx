import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import ProgressBar from '../common/ProgressBar';
import './ProfileComponents.css';

const ProfileCompletionCard = ({ completion }) => {
  if (!completion) return null;

  const percentage = completion.completionPercentage ?? 0;
  const incomplete = completion.incompleteSections || [];

  return (
    <div className="completion-widget-card">
      <div className="completion-top-row">
        <div className="completion-title-group">
          <h3>
            <Sparkles size={20} color="var(--blue-600)" />
            Profile Strength & Employability Readiness
          </h3>
        </div>
        <span className="completion-badge">{percentage}% Complete</span>
      </div>

      <ProgressBar
        value={percentage}
        color={percentage >= 80 ? 'green' : percentage >= 50 ? 'blue' : 'amber'}
        height={10}
      />

      {incomplete.length > 0 ? (
        <div className="incomplete-list">
          <span className="incomplete-label">
            Next steps to reach 100% recruiter visibility:
          </span>
          <div className="incomplete-chips">
            {incomplete.map((item, idx) => (
              <span key={idx} className="incomplete-chip">
                <AlertCircle size={13} /> {item}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="incomplete-list">
          <span className="incomplete-label" style={{ color: 'var(--success, #16a34a)' }}>
            <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            All profile sections completed! Your profile is fully visible to campus recruiters.
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionCard;
