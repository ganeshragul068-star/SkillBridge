import React from 'react';
import { GraduationCap, Calendar, Award, Edit3, Trash2 } from 'lucide-react';
import './ProfileComponents.css';

const EducationCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="item-card-row">
      <div className="item-card-content">
        <h4 className="item-title">{item.institution}</h4>
        <div className="item-subtitle">
          {item.degree} {item.department ? `in ${item.department}` : (item.fieldOfStudy ? `in ${item.fieldOfStudy}` : '')}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--slate-500)' }}>
          {(item.startYear || item.endYear) && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} /> {item.startYear ? `${item.startYear} – ` : ''}{item.endYear || 'Present'}
            </span>
          )}
          {item.grade && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--navy-900)', fontWeight: 600 }}>
              <Award size={13} /> Grade / CGPA: {item.grade}
            </span>
          )}
        </div>
      </div>

      <div className="item-actions">
        <button className="icon-btn-edit" onClick={() => onEdit(item)} title="Edit Record">
          <Edit3 size={15} />
        </button>
        <button className="icon-btn-delete" onClick={() => onDelete(item._id)} title="Delete Record">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default EducationCard;
