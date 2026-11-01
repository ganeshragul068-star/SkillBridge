import React from 'react';
import './StatCard.css';

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle = '',
  change = '',
  trend = 'neutral', // 'up', 'down', 'neutral'
  variant = 'blue' // 'navy', 'blue', 'emerald', 'amber'
}) => {
  return (
    <div className={`stat-card-root variant-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-box">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {(subtitle || change) && (
          <div className="stat-card-meta">
            {change && (
              <span className={`stat-card-trend trend-${trend}`}>
                {change}
              </span>
            )}
            {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
