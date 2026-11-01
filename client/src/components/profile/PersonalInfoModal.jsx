import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, Phone, MapPin, GraduationCap, Image, FileText } from 'lucide-react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import './ProfileComponents.css';

const PersonalInfoModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    department: '',
    degree: '',
    graduationYear: '',
    location: '',
    bio: '',
    profileImage: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.userId?.name || initialData.name || '',
        phone: initialData.phone || '',
        college: initialData.college || '',
        department: initialData.department || '',
        degree: initialData.degree || '',
        graduationYear: initialData.graduationYear ? String(initialData.graduationYear) : '',
        location: initialData.location || '',
        bio: initialData.bio || '',
        profileImage: initialData.profileImage || ''
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
      setError('Full name is required.');
      return;
    }

    if (formData.graduationYear) {
      const year = parseInt(formData.graduationYear, 10);
      if (isNaN(year) || year < 1970 || year > 2040) {
        setError('Please enter a valid graduation year between 1970 and 2040.');
        return;
      }
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update personal information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">Edit Personal & Academic Details</h2>
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
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alex Johnson"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Contact Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
              <FormInput
                label="City / Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, India"
              />
            </div>

            <FormInput
              label="College / Institution"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="e.g. National Institute of Technology"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Department / Branch"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
              <FormInput
                label="Degree Program"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech / B.E."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Graduation Year"
                name="graduationYear"
                type="number"
                min="1970"
                max="2040"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2026"
              />
              <FormInput
                label="Profile Picture URL (Optional)"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                Professional Biography
              </label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your technical background, interest in software development, and placement goals..."
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
            <Button variant="navy" size="sm" type="submit" icon={Save} loading={submitting}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoModal;
