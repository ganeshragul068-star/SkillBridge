import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Clock,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import SelectField from '../components/common/SelectField';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

import { useToast } from '../hooks/useToast';
import jobService from '../services/jobService';
import '../components/profile/ProfileComponents.css';

const AdminJobsPage = () => {
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    responsibilities: '',
    jobType: 'Internship',
    location: '',
    workMode: 'Remote',
    requiredSkills: '',
    qualifications: '',
    experience: 'Fresher / Entry Level',
    salary: 'Stipend / Disclosed upon interview',
    applicationDeadline: '',
    openings: 1,
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    jobId: null,
    jobTitle: ''
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getJobs({
        status: statusFilter,
        search: searchTerm,
        limit: 50
      });
      if (res && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch job postings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, searchTerm]);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      company: '',
      description: '',
      responsibilities: '',
      jobType: 'Internship',
      location: '',
      workMode: 'Remote',
      requiredSkills: '',
      qualifications: '',
      experience: 'Fresher / Entry Level',
      salary: 'Stipend / Disclosed upon interview',
      applicationDeadline: '',
      openings: 1,
      status: 'Active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    const dateStr = job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '';
    setFormData({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : (job.responsibilities || ''),
      jobType: job.jobType || 'Internship',
      location: job.location || '',
      workMode: job.workMode || 'Remote',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : (job.requiredSkills || ''),
      qualifications: Array.isArray(job.qualifications) ? job.qualifications.join(', ') : (job.qualifications || ''),
      experience: job.experience || 'Fresher / Entry Level',
      salary: job.salary || 'Stipend / Disclosed upon interview',
      applicationDeadline: dateStr,
      openings: job.openings || 1,
      status: job.status || 'Active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim() || !formData.location.trim()) {
      setFormError('Please fill in required fields: Title, Company, Description, and Location.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        openings: parseInt(formData.openings, 10) || 1,
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
          : [],
        requiredSkills: formData.requiredSkills
          ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        qualifications: formData.qualifications
          ? formData.qualifications.split(',').map((q) => q.trim()).filter(Boolean)
          : []
      };

      if (editingJob) {
        await jobService.updateJob(editingJob._id, payload);
        showToast(`Job '${formData.title}' updated successfully.`, 'success');
      } else {
        await jobService.createJob(payload);
        showToast(`New job posting '${formData.title}' published!`, 'success');
      }

      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
      await jobService.updateJob(job._id, { status: newStatus });
      showToast(`Position '${job.title}' marked as ${newStatus}.`, 'info');
      fetchJobs();
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await jobService.deleteJob(deleteDialog.jobId);
      showToast('Job posting deleted successfully.', 'info');
      setDeleteDialog({ isOpen: false, jobId: null, jobTitle: '' });
      fetchJobs();
    } catch (err) {
      showToast(err.message || 'Failed to delete job.', 'error');
    }
  };

  return (
    <PublicLayout>
      <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
        <PageHeader
          title="Job & Internship Management"
          description="Create, publish, edit, and review placement vacancies available to students across partner colleges."
          badge={`${jobs.length} Listed`}
          isPhase1Preview={false}
          actions={
            <Button variant="navy" size="sm" icon={Plus} onClick={handleOpenCreate}>
              Post New Opportunity
            </Button>
          }
        />

        {/* Filter bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <FormInput
                placeholder="Search by role title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['All', 'Active', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: statusFilter === st ? 'var(--navy-900)' : 'var(--border-color)',
                    backgroundColor: statusFilter === st ? 'var(--navy-900)' : '#ffffff',
                    color: statusFilter === st ? '#ffffff' : 'var(--slate-700)'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <LoadingState text="Loading job postings catalogue..." />
        ) : jobs.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--navy-900)' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Position & Company</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Type & Mode</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Location</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Openings</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <Link to={`/jobs/${job._id}`} style={{ fontWeight: 700, color: 'var(--navy-900)', textDecoration: 'none' }}>
                          {job.title}
                        </Link>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                          {job.company}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge badge-navy">{job.jobType}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                          {job.workMode}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--slate-600)' }}>
                        {job.location}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                        {job.openings || 1}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          style={{
                            border: 'none',
                            background: job.status === 'Active' ? '#dcfce7' : '#fee2e2',
                            color: job.status === 'Active' ? '#15803d' : '#b91c1c',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Click to toggle status"
                        >
                          {job.status}
                        </button>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(job)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, jobId: job._id, jobTitle: job.title })}
                            style={{ color: 'var(--danger)' }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description="Create your first job or internship posting to start receiving student candidate submissions."
            action={
              <Button variant="navy" size="md" icon={Plus} onClick={handleOpenCreate}>
                Post New Opening
              </Button>
            }
          />
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="profile-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
              <div className="profile-modal-header">
                <h2 className="profile-modal-title">
                  {editingJob ? `Edit Opportunity — ${editingJob.title}` : 'Post New Job / Internship'}
                </h2>
                <button className="icon-btn-delete" onClick={() => setIsModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="profile-modal-body">
                  {formError && (
                    <div style={{
                      backgroundColor: 'var(--danger-bg, #fee2e2)',
                      color: 'var(--danger, #dc2626)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem'
                    }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormInput
                      label="Job Title *"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="e.g. Junior MERN Stack Developer"
                      required
                    />
                    <FormInput
                      label="Hiring Company *"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      placeholder="e.g. TechNova Solutions"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      Detailed Job Description *
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Describe the opportunity, core expectations, and mentorship provided..."
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                      Responsibilities (One per line)
                    </label>
                    <textarea
                      name="responsibilities"
                      rows="3"
                      value={formData.responsibilities}
                      onChange={handleFormChange}
                      placeholder="Build reusable React UI components&#10;Implement backend REST APIs with Express&#10;Collaborate with product team on sprint deliverables"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                        Job Type
                      </label>
                      <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                      >
                        <option value="Internship">Internship</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                        Work Mode
                      </label>
                      <select
                        name="workMode"
                        value={formData.workMode}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>

                    <FormInput
                      label="Location *"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      placeholder="e.g. Bangalore, India"
                      required
                    />
                  </div>

                  <FormInput
                    label="Required Skills (Comma separated) *"
                    name="requiredSkills"
                    value={formData.requiredSkills}
                    onChange={handleFormChange}
                    placeholder="e.g. React.js, Node.js, Express, MongoDB, Git"
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormInput
                      label="Salary / Stipend"
                      name="salary"
                      value={formData.salary}
                      onChange={handleFormChange}
                      placeholder="e.g. ₹25,000 / month or ₹6–8 LPA"
                    />
                    <FormInput
                      label="Application Deadline"
                      name="applicationDeadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormInput
                      label="Openings Count"
                      name="openings"
                      type="number"
                      min="1"
                      value={formData.openings}
                      onChange={handleFormChange}
                    />
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                        Listing Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                      >
                        <option value="Active">Active (Accepting Applications)</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="profile-modal-footer">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button variant="navy" size="sm" type="submit" icon={Save} loading={submitting}>
                    {editingJob ? 'Update Opportunity' : 'Publish Opportunity'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Job Posting"
          message={`Are you sure you want to delete "${deleteDialog.jobTitle}"? This will also remove all associated student applications.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, jobId: null, jobTitle: '' })}
          variant="danger"
          confirmText="Yes, Delete Job"
        />
      </div>
    </PublicLayout>
  );
};

export default AdminJobsPage;
