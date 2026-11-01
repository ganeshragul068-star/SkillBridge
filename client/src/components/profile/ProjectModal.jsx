import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import './ProfileComponents.css';

const ProjectModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
    completionDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      const tech = initialData.technologies || initialData.techStack || [];
      const dateStr = initialData.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : '';
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        technologies: Array.isArray(tech) ? tech.join(', ') : tech,
        projectUrl: initialData.projectUrl || initialData.liveUrl || '',
        githubUrl: initialData.githubUrl || '',
        completionDate: dateStr
      });
      setError('');
    } else {
      setFormData({
        title: '',
        description: '',
        technologies: '',
        projectUrl: '',
        githubUrl: '',
        completionDate: ''
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

    if (!formData.title.trim()) {
      setError('Project title is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        technologies: formData.technologies
          ? formData.technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">
            {initialData?._id ? 'Edit Portfolio Project' : 'Add Portfolio Project'}
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
              label="Project Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. SkillBridge – Youth Employability Platform"
              required
            />

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                Project Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Highlight problem solved, system architecture, key accomplishments..."
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

            <FormInput
              label="Technologies Used (Comma separated)"
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="e.g. React.js, Node.js, Express, MongoDB Atlas, JWT"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormInput
                label="Live Application URL"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleChange}
                placeholder="https://myproject.app"
              />
              <FormInput
                label="GitHub Repository URL"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <FormInput
              label="Completion Date"
              name="completionDate"
              type="date"
              value={formData.completionDate}
              onChange={handleChange}
            />
          </div>

          <div className="profile-modal-footer">
            <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="navy" size="sm" type="submit" icon={Save} loading={submitting}>
              {initialData?._id ? 'Update Project' : 'Save Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
