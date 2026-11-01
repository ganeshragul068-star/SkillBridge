import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import './SkillBadge.css';

const SkillBadge = ({
  name,
  level = '',
  status = 'default', // 'default', 'acquired', 'gap', 'in-progress'
  size = 'md',        // 'sm', 'md'
  removable = false,
  onRemove = null
}) => {
  return (
    <span className={`skill-badge-item badge-status-${status} badge-size-${size}`}>
      {status === 'acquired' && <Check size={12} className="skill-badge-icon" />}
      {status === 'gap' && <AlertCircle size={12} className="skill-badge-icon" />}
      <span className="skill-badge-name">{name}</span>
      {level && <span className="skill-badge-level">{level}</span>}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="skill-badge-remove"
          aria-label={`Remove ${name}`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
