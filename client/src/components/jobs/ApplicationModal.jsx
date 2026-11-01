import React, { useState, useEffect } from 'react';
import { X, Send, Briefcase, Building, FileText, CheckCircle2 } from 'lucide-react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import applicationService from '../../services/applicationService';
import profileService from '../../services/profileService';
import '../profile/ProfileComponents.css';

const ApplicationModal = ({ isOpen, onClose, job, onApplicationSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    phone: '',
    college: '',
    resumeUrl: '',
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && job) {
      // Pre-fill from authenticated user and profile
      setFormData({
        studentName: user?.name || '',
        studentEmail: user?.email || '',
        phone: user?.profile?.phone || '',
        college: user?.profile?.college || '',
        resumeUrl: '',
        coverLetter: ''
      });
      setError('');

      // Fetch latest profile details if available
      const loadProfile = async () => {
        try {
          const res = await profileService.getProfileMe();
          if (res?.data) {
            setFormData((prev) => ({
              ...prev,
              phone: res.data.phone || prev.phone,
              college: res.data.college || prev.college
            }));
          }
        } catch (_) {}
      };
      loadProfile();
    }
  }, [isOpen, job, user]);

  if (!isOpen || !job) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.studentName.trim() || !formData.studentEmail.trim()) {
      setError('Student name and email are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await applicationService.applyForJob({
        jobId: job._id || job.id,
        resumeUrl: formData.resumeUrl.trim(),
        coverLetter: formData.coverLetter.trim(),
        phone: formData.phone.trim()
      });

      showToast(`Successfully applied to ${job.title} at ${job.company}!`, 'success');
      if (onApplicationSuccess) onApplicationSuccess(res.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="profile-modal-header">
          <div>
            <h2 className="profile-modal-title">Apply for Position</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              {job.title} • {job.company}
            </p>
          </div>
          <button className="icon-btn-delete" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-modal-body">
            {error && (
              <div style={{
                backgroundColor: 'var(--danger-bg, #fee2e2)',
                color: 'var(--danger, #dc2626)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                {error}
              </div>
            )}

            <div style={{
              background: 'var(--blue-50, #eff6ff)',
              border: '1px solid var(--blue-200, #bfdbfe)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--blue-900, #1e3a8a)'
            }}>
              <strong>Application Notice:</strong> Your verified academic profile and skills matrix will be shared with the recruiting team for <strong>{job.company}</strong>.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Full Name *"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Email Address *"
                name="studentEmail"
                type="email"
                value={formData.studentEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Contact Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
              <FormInput
                label="Current College / University"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. College of Engineering"
              />
            </div>

            <FormInput
              label="Online Resume Link (Google Drive / LinkedIn / Portfolio URL)"
              name="resumeUrl"
              value={formData.resumeUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/... or https://myportfolio.dev/resume.pdf"
            />

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                Cover Letter / Why are you a good fit?
              </label>
              <textarea
                name="coverLetter"
                rows="4"
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Mention relevant coursework, hands-on projects, technical proficiencies, and your motivation for joining..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div className="profile-modal-footer">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="navy" size="sm" type="submit" icon={Send} loading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
