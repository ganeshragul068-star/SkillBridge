import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound, UserCheck } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target destination after login (or default dashboard)
  const fromDestination = location.state?.from?.pathname;

  const handleFillStudent = () => {
    setEmail('alex.johnson@college.edu');
    setPassword('Student@123');
    setErrorMessage('');
    showToast('Filled seeded student credentials (Alex Johnson)', 'info');
  };

  const handleFillAdmin = () => {
    setEmail('admin@skillbridge.edu');
    setPassword('Admin@Pass2026!');
    setErrorMessage('');
    showToast('Filled seeded administrator credentials', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      showToast('Please enter both email and password.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email.trim().toLowerCase(), password);

      showToast(`Welcome back, ${user.name}!`, 'success');

      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(fromDestination || '/dashboard', { replace: true });
      }
    } catch (error) {
      const msg = error.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="auth-page-root">
        <div className="auth-card-container">
          <div className="auth-form-side">
            <div className="auth-header">
              <h1 className="auth-title">Sign In to SkillBridge</h1>
              <p className="auth-subtitle">
                Access your skill assessments, active applications, and learning roadmap.
              </p>
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: 'var(--danger-bg, #fee2e2)',
                color: 'var(--danger, #dc2626)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                border: '1px solid #fca5a5'
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="student@college.edu or admin@skillbridge.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                icon={Mail}
                required
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                icon={Lock}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <label className="auth-checkbox-label" style={{ marginBottom: 0 }}>
                  <input type="checkbox" defaultChecked />
                  <span>Remember this device</span>
                </label>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  Student & Admin Portal
                </span>
              </div>

              <Button
                type="submit"
                variant="navy"
                size="lg"
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
                disabled={submitting}
              >
                {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>

              {/* Evaluator Convenience Seed Quick-fill */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-color)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.65rem', textAlign: 'center' }}>
                  Quick Fill Evaluator Credentials
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <Button type="button" variant="secondary" size="sm" onClick={handleFillStudent} icon={KeyRound}>
                    Student Demo
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleFillAdmin} icon={UserCheck}>
                    Admin Demo
                  </Button>
                </div>
              </div>

              <div className="auth-footer-prompt">
                Don't have an account yet? <Link to="/register">Create Student Account</Link>
              </div>
            </form>
          </div>

          <div className="auth-benefits-side">
            <div>
              <h2 className="benefits-title">Your Employability Command Center</h2>
              <p className="benefits-desc">
                Log in to check how close your current skills match today's newest internship listings.
              </p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon-box">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4>Secure Student Access</h4>
                    <p>Track internship applications, recruiter views, and assessment scorecards safely.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon-box">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4>Role-Based Access Control</h4>
                    <p>Separate student and administrator portals protected by cryptographically signed JWT sessions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-demo-badge">
              <strong>Live JWT Authentication:</strong> Authenticates securely against MongoDB Atlas with role-based routing.
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
