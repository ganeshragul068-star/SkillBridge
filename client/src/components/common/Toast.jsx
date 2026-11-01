import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon toast-icon-success" />,
    error: <AlertCircle size={18} className="toast-icon toast-icon-error" />,
    info: <Info size={18} className="toast-icon toast-icon-info" />
  };

  return (
    <div className={`toast-card toast-${type}`}>
      {icons[type] || icons.info}
      <span className="toast-text">{message}</span>
      {onClose && (
        <button onClick={onClose} className="toast-close" aria-label="Dismiss notification">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Toast;
