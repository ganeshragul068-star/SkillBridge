import React from 'react';
import './LoadingState.css';

const LoadingState = ({ message = 'Loading SkillBridge data...' }) => {
  return (
    <div className="loading-state-wrapper">
      <div className="loading-spinner" />
      <span className="loading-msg">{message}</span>
    </div>
  );
};

export default LoadingState;
