import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import './ProfileComponents.css';

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Database',
  'Cloud Computing',
  'AI and Machine Learning',
  'DevOps',
  'Tools and Technologies',
  'Soft Skills'
];

export const PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

const AddEditSkillModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Programming Languages',
    proficiency: 'Intermediate',
    yearsOfExperience: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Programming Languages',
        proficiency: initialData.proficiency || 'Intermediate',
        yearsOfExperience: initialData.yearsOfExperience !== undefined ? initialData.yearsOfExperience : 0
      });
      setError('');
    } else {
      setFormData({
        name: '',
        category: 'Programming Languages',
        proficiency: 'Intermediate',
        yearsOfExperience: 0
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
      setError('Skill name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        name: formData.name.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10) || 0
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save skill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">
            {initialData?._id ? 'Edit Skill' : 'Add Technical or Professional Skill'}
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
              label="Skill Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. React.js, Docker, MongoDB, Python, Agile"
              required
            />

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                Skill Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  backgroundColor: '#ffffff'
                }}
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                  Proficiency Level *
                </label>
                <select
                  name="proficiency"
                  value={formData.proficiency}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {PROFICIENCY_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Experience (Years)"
                name="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                value={formData.yearsOfExperience}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="profile-modal-footer">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="navy" size="sm" type="submit" icon={Save} loading={submitting}>
              {initialData?._id ? 'Update Skill' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditSkillModal;
