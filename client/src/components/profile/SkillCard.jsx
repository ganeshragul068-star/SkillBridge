import React from 'react';
import { Award, Clock, Edit3, Trash2 } from 'lucide-react';
import './ProfileComponents.css';

const SkillCard = ({ skill, onEdit, onDelete }) => {
  const getProficiencyClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'pill-beginner';
      case 'intermediate':
        return 'pill-intermediate';
      case 'advanced':
        return 'pill-advanced';
      case 'expert':
        return 'pill-expert';
      default:
        return 'pill-intermediate';
    }
  };

  return (
    <div className="skill-entity-card">
      <div>
        <div className="skill-card-top">
          <h4 className="skill-card-name">{skill.name}</h4>
          <span className={`proficiency-pill ${getProficiencyClass(skill.proficiency)}`}>
            {skill.proficiency || 'Intermediate'}
          </span>
        </div>
        <div className="skill-card-category">{skill.category || 'General'}</div>
      </div>

      <div className="skill-card-footer">
        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={12} />
          {skill.yearsOfExperience ? `${skill.yearsOfExperience} yr${skill.yearsOfExperience > 1 ? 's' : ''} exp` : 'Practical skill'}
        </span>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="icon-btn-edit" onClick={() => onEdit(skill)} title="Edit Skill">
            <Edit3 size={14} />
          </button>
          <button className="icon-btn-delete" onClick={() => onDelete(skill._id)} title="Delete Skill">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
