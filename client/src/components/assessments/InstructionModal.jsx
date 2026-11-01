import React from 'react';
import { AlertTriangle, Clock, HelpCircle, Award, CheckCircle2, ShieldAlert, X } from 'lucide-react';

const InstructionModal = ({ assessment, onClose, onConfirmStart, isLoading }) => {
  if (!assessment) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(3px)'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#2563eb',
                letterSpacing: '0.05em'
              }}
            >
              Assessment Pre-Flight Check
            </span>
            <h2 style={{ margin: '0.2rem 0', fontSize: '1.25rem', color: 'var(--navy-900, #0f172a)' }}>
              {assessment.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              color: 'var(--slate-400, #94a3b8)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Specifications Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--slate-50, #f8fafc)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--slate-200, #e2e8f0)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <HelpCircle size={16} color="#2563eb" />
            <span>Questions: <strong>{assessment.totalQuestions}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="#2563eb" />
            <span>Time Limit: <strong>{assessment.duration} Minutes</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={16} color="#2563eb" />
            <span>Total Marks: <strong>{assessment.totalMarks}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Passing Mark: <strong>{assessment.passingScore}%</strong></span>
          </div>
        </div>

        {/* Important Instructions */}
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--navy-900, #0f172a)' }}>
          Assessment Rules & Guidelines:
        </h4>
        <ul style={{ margin: '0 0 1.25rem 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--slate-600, #475569)', lineHeight: 1.6 }}>
          <li>Each question provides multiple choices with exactly one correct option.</li>
          <li>You may navigate between questions using the <strong>Previous</strong>, <strong>Next</strong>, and Question Palette controls.</li>
          <li>You can alter your selected answers freely at any point before clicking final Submit.</li>
          <li>Your answers are automatically evaluated against MongoDB answer keys on the server upon completion.</li>
          <li>Achieving $\ge {assessment.passingScore}\%$ grants an <strong>Assessment Verified</strong> badge for <strong>{assessment.skill}</strong> on your profile.</li>
        </ul>

        {/* Timer Tampering Warning */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            marginBottom: '1.5rem',
            fontSize: '0.825rem',
            color: '#b45309'
          }}
        >
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Strict Countdown Timer:</strong>
            <p style={{ margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
              Once you click "Begin Assessment", the session timer starts immediately. <strong>Refreshing the browser or closing the window will not reset or pause the countdown timer.</strong> The system will automatically submit your attempt when time expires.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              border: '1px solid var(--slate-300, #cbd5e1)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmStart}
            disabled={isLoading}
            style={{
              padding: '0.55rem 1.5rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {isLoading ? 'Starting...' : 'Begin Assessment Now →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
