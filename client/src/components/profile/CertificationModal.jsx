import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import './ProfileComponents.css';

const CertificationModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      const dateStr = initialData.issueDate ? new Date(initialData.issueDate).toISOString().split('T')[0] : '';
      setFormData({
        name: initialData.name || initialData.title || '',
        issuingOrganization: initialData.issuingOrganization || initialData.issuer || '',
        issueDate: dateStr,
        credentialId: initialData.credentialId || '',
        credentialUrl: initialData.credentialUrl || ''
      });
      setError('');
    } else {
      setFormData({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        credentialId: '',
        credentialUrl: ''
      });
      setError('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Certification name is required.');
      return;
    }

    if (!formData.issuingOrganization.trim()) {
      setError('Issuing organization is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save certification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">
            {initialData?._id ? 'Edit Professional Certification' : 'Add Professional Certification'}
          </h2>
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

            <FormInput
              label="Certification Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. AWS Certified Cloud Practitioner / Meta React Specialization"
              required
            />

            <FormInput
              label="Issuing Organization *"
              name="issuingOrganization"
              value={formData.issuingOrganization}
              onChange={handleChange}
              placeholder="e.g. Amazon Web Services, Coursera, freeCodeCamp"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Issue Date"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleChange}
              />
              <FormInput
                label="Credential ID"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleChange}
                placeholder="e.g. AWS-01293847"
              />
            </div>

            <FormInput
              label="Verification URL"
              name="credentialUrl"
              value={formData.credentialUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="profile-modal-footer">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="navy" size="sm" type="submit" icon={Save} loading={submitting}>
              {initialData?._id ? 'Update Certification' : 'Save Certification'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificationModal;
