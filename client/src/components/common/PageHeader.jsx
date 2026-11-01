import React from 'react';
import './PageHeader.css';

const PageHeader = ({
  title,
  description,
  badge = null,
  actions = null,
  isPhase1Preview = false
}) => {
  return (
    <div className="page-header-wrapper">
      <div className="page-header-content">
        <div className="page-header-title-row">
          <h1 className="page-header-title">{title}</h1>
          {badge && <span className="page-header-badge">{badge}</span>}
        </div>
        {description && <p className="page-header-desc">{description}</p>}
        {isPhase1Preview && (
          <div className="phase1-preview-banner">
            <span className="phase1-tag">Phase 1 UI Layout</span>
            <span>This page demonstrates the intended design and data flow. Dynamic backend features will be linked in Phase 2.</span>
          </div>
        )}
      </div>

      {actions && (
        <div className="page-header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
