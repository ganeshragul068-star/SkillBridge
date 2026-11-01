import React, { useState, useEffect } from 'react';
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  ExternalLink,
  ChevronRight,
  XCircle,
  ArrowRight,
  Ban
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

import { useToast } from '../hooks/useToast';
import applicationService from '../services/applicationService';
import '../components/profile/ProfileComponents.css';

// Status badge color and icon helper
const getStatusMeta = (status) => {
  switch (status) {
    case 'Applied':
      return { variant: 'navy', label: 'Applied', color: '#1e3a8a', bg: '#dbeafe', step: 1 };
    case 'Under Review':
      return { variant: 'amber', label: 'Under Review', color: '#b45309', bg: '#fef3c7', step: 2 };
    case 'Shortlisted':
      return { variant: 'emerald', label: 'Shortlisted for Interview', color: '#15803d', bg: '#dcfce7', step: 3 };
    case 'Selected':
      return { variant: 'success', label: 'Selected / Offer Extended', color: '#166534', bg: '#bbf7d0', step: 4 };
    case 'Rejected':
      return { variant: 'danger', label: 'Not Selected', color: '#b91c1c', bg: '#fee2e2', step: -1 };
    case 'Withdrawn':
      return { variant: 'neutral', label: 'Withdrawn by Candidate', color: '#475569', bg: '#f1f5f9', step: 0 };
    default:
      return { variant: 'navy', label: status, color: '#1e3a8a', bg: '#dbeafe', step: 1 };
  }
};

const ApplicationsPage = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Withdraw confirmation dialog
  const [withdrawDialog, setWithdrawDialog] = useState({
    isOpen: false,
    appId: null,
    jobTitle: ''
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getMyApplications();
      if (res && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch application records from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdrawClick = (app) => {
    setWithdrawDialog({
      isOpen: true,
      appId: app._id,
      jobTitle: app.jobId?.title || 'this position'
    });
  };

  const confirmWithdraw = async () => {
    try {
      await applicationService.withdrawApplication(withdrawDialog.appId);
      showToast('Application withdrawn successfully.', 'info');
      setWithdrawDialog({ isOpen: false, appId: null, jobTitle: '' });
      fetchApplications();
    } catch (err) {
      showToast(err.message || 'Failed to withdraw application.', 'error');
    }
  };

  return (
    <DashboardLayout pageTitle="My Applications">
      <div style={{ paddingBottom: '3rem' }}>
        <PageHeader
          title="Job & Internship Applications"
          description="Track your hiring pipeline, recruiter review stages, and interview round notifications in real time."
          badge={`${applications.length} Submissions`}
          isPhase1Preview={false}
          actions={
            <Link to="/jobs">
              <Button variant="navy" size="sm" icon={Send}>
                Apply for More Jobs
              </Button>
            </Link>
          }
        />

        {loading ? (
          <LoadingState text="Loading your application tracking pipeline..." />
        ) : applications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => {
              const job = app.jobId;
              const meta = getStatusMeta(app.status);
              const appliedDate = new Date(app.appliedAt || app.createdAt).toLocaleDateString();
              const updatedDate = new Date(app.updatedAt).toLocaleDateString();

              return (
                <div
                  key={app._id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    borderLeft: `4px solid ${meta.color}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--navy-900)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.2rem'
                        }}
                      >
                        {job?.company ? job.company.charAt(0).toUpperCase() : 'J'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: '0 0 0.2rem 0' }}>
                          {job?.title || 'Software Engineering Position'}
                        </h3>
                        <span style={{ fontSize: '0.9rem', color: 'var(--slate-600)', fontWeight: 500 }}>
                          {job?.company || 'Partner Recruiter'} • {job?.location || 'Remote'}
                        </span>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--slate-500)', flexWrap: 'wrap' }}>
                          <span>Submitted: {appliedDate}</span>
                          <span>•</span>
                          <span>Last Activity: {updatedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.85rem',
                          borderRadius: 'var(--radius-full)',
                          color: meta.color,
                          backgroundColor: meta.bg
                        }}
                      >
                        {meta.label}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        Details
                      </Button>

                      {app.status !== 'Withdrawn' && app.status !== 'Rejected' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWithdrawClick(app)}
                          style={{ color: 'var(--danger)', fontSize: '0.8rem' }}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Pipeline */}
                  {app.status !== 'Withdrawn' && app.status !== 'Rejected' ? (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                        {['Applied', 'Under Review', 'Shortlisted', 'Selected'].map((stepName, stepIndex) => {
                          const stepNumber = stepIndex + 1;
                          const isDone = meta.step >= stepNumber;
                          const isCurrent = meta.step === stepNumber;

                          return (
                            <div key={stepName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center', position: 'relative' }}>
                              <div
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  backgroundColor: isDone ? 'var(--blue-600)' : 'var(--slate-200)',
                                  color: isDone ? '#ffffff' : 'var(--slate-500)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  zIndex: 2
                                }}
                              >
                                {isDone ? <CheckCircle2 size={16} /> : stepNumber}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isCurrent ? 'var(--navy-900)' : 'var(--slate-500)',
                                  marginTop: '0.25rem'
                                }}
                              >
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontStyle: 'italic', padding: '0.25rem 0' }}>
                      Status update: {app.status === 'Withdrawn' ? 'You withdrew this application.' : 'The recruitment process for this position has concluded.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Send}
            title="No applications submitted yet"
            description="Explore verified opportunities on the jobs portal and submit applications to start your hiring process."
            action={
              <Link to="/jobs">
                <Button variant="navy" size="md">
                  Browse Active Jobs
                </Button>
              </Link>
            }
          />
        )}

        {/* Application Details Modal */}
        {selectedApp && (
          <div className="profile-modal-overlay" onClick={() => setSelectedApp(null)}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="profile-modal-header">
                <div>
                  <h2 className="profile-modal-title">Application Record</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    {selectedApp.jobId?.title} • {selectedApp.jobId?.company}
                  </p>
                </div>
                <button className="icon-btn-delete" onClick={() => setSelectedApp(null)}>
                  <XCircle size={18} />
                </button>
              </div>

              <div className="profile-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
                    <strong style={{ display: 'block', color: 'var(--navy-900)' }}>{selectedApp.status}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Applied Date</span>
                    <span style={{ display: 'block', color: 'var(--slate-700)' }}>
                      {new Date(selectedApp.appliedAt || selectedApp.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedApp.resumeUrl && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Attached Resume
                    </span>
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--blue-600)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                    >
                      <ExternalLink size={14} /> Open Resume Document
                    </a>
                  </div>
                )}

                {selectedApp.coverLetter && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                      Cover Letter / Statement
                    </span>
                    <p style={{ background: '#ffffff', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--slate-700)', margin: 0, whiteSpace: 'pre-line' }}>
                      {selectedApp.coverLetter}
                    </p>
                  </div>
                )}

                {/* Audit Trail of Status History */}
                {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                      Status History & Notes
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                      {selectedApp.statusHistory.map((hist, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                          <div>
                            <strong>{hist.newStatus}</strong>
                            {hist.notes && <span style={{ display: 'block', color: 'var(--slate-500)', fontSize: '0.75rem' }}>{hist.notes}</span>}
                          </div>
                          <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                            {new Date(hist.changedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-modal-footer">
                {selectedApp.jobId?._id && (
                  <Link to={`/jobs/${selectedApp.jobId._id}`}>
                    <Button variant="secondary" size="sm">
                      View Job Posting
                    </Button>
                  </Link>
                )}
                <Button variant="navy" size="sm" onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Confirmation */}
        <ConfirmationDialog
          isOpen={withdrawDialog.isOpen}
          title="Withdraw Application"
          message={`Are you sure you want to withdraw your application for "${withdrawDialog.jobTitle}"? This will cancel your submission with the hiring team.`}
          onConfirm={confirmWithdraw}
          onCancel={() => setWithdrawDialog({ isOpen: false, appId: null, jobTitle: '' })}
          variant="danger"
          confirmText="Yes, Withdraw"
        />
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;
