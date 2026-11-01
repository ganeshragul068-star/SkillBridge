import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import './ProfileComponents.css';

const EducationModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    department: '',
    startYear: '',
    endYear: '',
    grade: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        institution: initialData.institution || '',
        degree: initialData.degree || '',
        department: initialData.department || initialData.fieldOfStudy || '',
        startYear: initialData.startYear ? String(initialData.startYear) : '',
        endYear: initialData.endYear ? String(initialData.endYear) : '',
        grade: initialData.grade || ''
      });
      setError('');
    } else {
      setFormData({
        institution: '',
        degree: '',
        department: '',
        startYear: '',
        endYear: '',
        grade: ''
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

    if (!formData.institution.trim()) {
      setError('Institution name is required.');
      return;
    }

    if (!formData.degree.trim()) {
      setError('Degree or certificate title is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        startYear: formData.startYear ? parseInt(formData.startYear, 10) : undefined,
        endYear: formData.endYear ? parseInt(formData.endYear, 10) : undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save education record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">
            {initialData?._id ? 'Edit Education Qualification' : 'Add Education Qualification'}
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
              label="Institution / University Name *"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="e.g. National Institute of Technology, Trichy"
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Degree / Diploma *"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech, M.S., Higher Secondary"
                required
              />
              <FormInput
                label="Department / Field of Study"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Start Year"
                name="startYear"
                type="number"
                min="1970"
                max="2040"
                value={formData.startYear}
                onChange={handleChange}
                placeholder="2022"
              />
              <FormInput
                label="End Year (or Expected)"
                name="endYear"
                type="number"
                min="1970"
                max="2040"
                value={formData.endYear}
                onChange={handleChange}
                placeholder="2026"
              />
              <FormInput
                label="Grade / CGPA"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="e.g. 8.7 / 10"
              />
            </div>
          </div>

          <div className="profile-modal-footer">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="navy" size="sm" type="submit" icon={Save} loading={submitting}>
              {initialData?._id ? 'Update Record' : 'Save Education'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationModal;
