import React from 'react';
import { Target, Briefcase, Compass, TrendingUp, FileCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import './FeatureCard.css';

const iconMap = {
  Target,
  Briefcase,
  Compass,
  TrendingUp,
  FileCheck,
  GraduationCap
};

const FeatureCard = ({ title, description, icon, tag }) => {
  const IconComponent = typeof icon === 'string' ? (iconMap[icon] || Target) : (icon || Target);

  return (
    <div className="feature-card">
      <div className="feature-card-header">
        <div className="feature-icon-wrapper">
          <IconComponent size={24} className="feature-icon" />
        </div>
        {tag && <span className="feature-tag">{tag}</span>}
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      <div className="feature-footer">
        <span className="feature-learn-more">
          Learn how it works <span className="arrow">→</span>
        </span>
      </div>
    </div>
  );
};

export default FeatureCard;
