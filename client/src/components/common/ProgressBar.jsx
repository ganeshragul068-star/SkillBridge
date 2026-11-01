import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  showValue = true,
  color = 'blue', // 'blue', 'navy', 'green', 'amber'
  height = 8
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="progress-bar-group">
      {(label || showValue) && (
        <div className="progress-bar-labels">
          {label && <span className="progress-bar-title">{label}</span>}
          {showValue && <span className="progress-bar-val">{percentage}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className={`progress-fill fill-${color}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
