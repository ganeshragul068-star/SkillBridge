import React, { useState, useEffect } from 'react';
import {
  Award,
  FileText,
  Check,
  X,
  Search,
  ExternalLink,
  Clock,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

import { useToast } from '../hooks/useToast';
import applicationService from '../services/applicationService';
import '../components/profile/ProfileComponents.css';

const statuses = ['All', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'];

const AdminApplicationsPage = () => {
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected application for review modal
  const [activeApp, setActiveApp] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getAdminApplications({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchTerm,
        limit: 50
      });
      if (res && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch candidate applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, searchTerm]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setStatusUpdating(true);
      await applicationService.updateApplicationStatus(appId, newStatus, notesInput);
      showToast(`Application marked as '${newStatus}' with audit history logged.`, 'success');
      setNotesInput('');
      if (activeApp) {
        setActiveApp((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      fetchApplications();
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
        <PageHeader
          title="Campus Recruiter & Admin Application Queue"
          description="Evaluate candidate submissions across all college partner programs, verify student skill credentials, and manage hiring pipeline stages."
          badge={`${applications.length} Submissions`}
          isPhase1Preview={false}
        />

        {/* Search & Filter Toolbar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <FormInput
                placeholder="Search candidate name, email, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
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

        {/* Applications Queue Table */}
        {loading ? (
          <LoadingState text="Loading candidate application submissions..." />
        ) : applications.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--navy-900)' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Candidate</th>
                    <th style={{ padding: '1rem 1.25rem' }}>College / Program</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Applied Position</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Applied Date</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Evaluation Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const studentName = app.studentName || app.studentId?.name || 'Student Candidate';
                    const studentEmail = app.studentEmail || app.studentId?.email || '';
                    const college = app.college || app.profile?.college || 'Engineering College';
                    const degree = app.profile?.degree || 'B.Tech';

                    return (
                      <tr key={app._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--navy-900)', display: 'block' }}>
                            {studentName}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                            {studentEmail}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--slate-700)' }}>
                          <span>{college}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {degree} {app.profile?.department ? `• ${app.profile.department}` : ''}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--navy-900)', display: 'block' }}>
                            {app.jobId?.title || 'Job Opening'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {app.jobId?.company || 'Company'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                          {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor:
                                app.status === 'Shortlisted'
                                  ? '#dcfce7'
                                  : app.status === 'Selected'
                                  ? '#bbf7d0'
                                  : app.status === 'Under Review'
                                  ? '#fef3c7'
                                  : app.status === 'Rejected'
                                  ? '#fee2e2'
                                  : '#dbeafe',
                              color:
                                app.status === 'Shortlisted' || app.status === 'Selected'
                                  ? '#15803d'
                                  : app.status === 'Under Review'
                                  ? '#b45309'
                                  : app.status === 'Rejected'
                                  ? '#b91c1c'
                                  : '#1e3a8a'
                            }}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => setActiveApp(app)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No candidate applications found"
            description="No applications match your selected status filter or candidate search criteria."
            action={
              <Button variant="navy" size="sm" onClick={() => { setStatusFilter('All'); setSearchTerm(''); }}>
                Reset Filters
              </Button>
            }
          />
        )}

        {/* Detailed Evaluation & Status Transition Modal */}
        {activeApp && (
          <div className="profile-modal-overlay" onClick={() => setActiveApp(null)}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
              <div className="profile-modal-header">
                <div>
                  <h2 className="profile-modal-title">Candidate Evaluation</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    {activeApp.studentName || activeApp.studentId?.name} &bull; {activeApp.jobId?.title} at {activeApp.jobId?.company}
                  </p>
                </div>
                <button className="icon-btn-delete" onClick={() => setActiveApp(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="profile-modal-body">
                {/* Academic & Contact Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--navy-900)' }}>{activeApp.studentEmail || activeApp.studentId?.email}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</span>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--navy-900)' }}>{activeApp.phone || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>College</span>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--navy-900)' }}>{activeApp.college || activeApp.profile?.college}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Graduation Year</span>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--navy-900)' }}>{activeApp.profile?.graduationYear || '2026'}</strong>
                  </div>
                </div>

                {/* Resume Link */}
                {activeApp.resumeUrl ? (
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--blue-50)', border: '1px solid var(--blue-200)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--blue-900)', fontWeight: 600 }}>Candidate Online Resume:</span>
                    <a
                      href={activeApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--blue-700)', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <ExternalLink size={14} /> Open Resume Document
                    </a>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontStyle: 'italic', margin: 0 }}>
                    Candidate did not attach an external resume link (profile details will be used).
                  </p>
                )}

                {/* Candidate Verified Skills */}
                {activeApp.profile?.skills && activeApp.profile.skills.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Candidate Technical Skills ({activeApp.profile.skills.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {activeApp.profile.skills.map((s, idx) => (
                        <span key={idx} className="job-skill-tag" style={{ fontSize: '0.75rem' }}>
                          {s.name} ({s.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {activeApp.coverLetter && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                      Cover Letter / Statement of Interest
                    </span>
                    <p style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--slate-700)', margin: 0, whiteSpace: 'pre-line' }}>
                      {activeApp.coverLetter}
                    </p>
                  </div>
                )}

                {/* Status Decision Controls */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)', display: 'block', marginBottom: '0.5rem' }}>
                    Recruiter Evaluation Decision:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      variant={activeApp.status === 'Under Review' ? 'navy' : 'secondary'}
                      size="sm"
                      onClick={() => handleStatusChange(activeApp._id, 'Under Review')}
                      disabled={statusUpdating}
                    >
                      Under Review
                    </Button>
                    <Button
                      variant={activeApp.status === 'Shortlisted' ? 'navy' : 'secondary'}
                      size="sm"
                      onClick={() => handleStatusChange(activeApp._id, 'Shortlisted')}
                      disabled={statusUpdating}
                      style={{ color: '#15803d' }}
                    >
                      Shortlist for Interview
                    </Button>
                    <Button
                      variant={activeApp.status === 'Selected' ? 'navy' : 'secondary'}
                      size="sm"
                      onClick={() => handleStatusChange(activeApp._id, 'Selected')}
                      disabled={statusUpdating}
                      style={{ color: '#166534' }}
                    >
                      Extend Offer (Select)
                    </Button>
                    <Button
                      variant={activeApp.status === 'Rejected' ? 'navy' : 'secondary'}
                      size="sm"
                      onClick={() => handleStatusChange(activeApp._id, 'Rejected')}
                      disabled={statusUpdating}
                      style={{ color: 'var(--danger)' }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>

              <div className="profile-modal-footer">
                <Button variant="navy" size="sm" onClick={() => setActiveApp(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default AdminApplicationsPage;
