import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Send,
  Bookmark,
  Users,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import Button from '../components/common/Button';
import SkillBadge from '../components/common/SkillBadge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ApplicationModal from '../components/jobs/ApplicationModal';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import jobService from '../services/jobService';
import savedJobService from '../services/savedJobService';
import { sampleJobs } from '../data/mockData';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplyingModal, setIsApplyingModal] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await jobService.getJobById(id);
      if (res && res.data) {
        setJob(res.data);
        setHasApplied(Boolean(res.data.hasApplied));
        setIsSaved(Boolean(res.data.isSaved));
        setSimilarJobs(res.similarJobs || []);
      }
    } catch (err) {
      // Fallback to sample job matching ID
      const fallback = sampleJobs.find((j) => j.id === id) || sampleJobs[0];
      setJob(fallback);
      setSimilarJobs(sampleJobs.filter((j) => j.id !== id).slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Please log in to save opportunities to your bookmarks.', 'info');
      return;
    }

    try {
      if (isSaved) {
        await savedJobService.removeSavedJob(job._id || job.id);
        setIsSaved(false);
        showToast('Job removed from your bookmarks.', 'info');
      } else {
        await savedJobService.saveJob(job._id || job.id);
        setIsSaved(true);
        showToast('Job saved to your bookmarks!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Bookmark action failed.', 'error');
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      showToast('Please log in as a student to apply for positions.', 'info');
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      showToast('Admins manage postings and review candidate submissions.', 'info');
      return;
    }
    setIsApplyingModal(true);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
          <LoadingState text="Loading detailed position overview..." />
        </div>
      </PublicLayout>
    );
  }

  if (!job) {
    return (
      <PublicLayout>
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
          <EmptyState
            icon={Briefcase}
            title="Opportunity Not Found"
            description="The job position you requested is either closed, removed, or unavailable."
            action={
              <Link to="/jobs">
                <Button variant="navy" size="sm">Browse Active Jobs</Button>
              </Link>
            }
          />
        </div>
      </PublicLayout>
    );
  }

  const deadline = job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Rolling review';
  const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent';
  const isClosed = job.status === 'Closed' || job.isExpired;

  return (
    <PublicLayout>
      <div className="job-details-root" style={{ paddingBottom: '4rem' }}>
        <div className="container">
          {/* Breadcrumb Back Link */}
          <div className="job-back-nav">
            <Link to="/jobs" className="back-link">
              <ArrowLeft size={16} /> Back to Job Listings
            </Link>
          </div>

          <div className="job-details-grid">
            {/* Main Details Body */}
            <div className="job-details-main">
              {/* Header Box */}
              <div className="job-hero-card">
                <div className="job-hero-top">
                  <div className="job-avatar-lg">{job.company.charAt(0).toUpperCase()}</div>
                  <div className="job-hero-titles">
                    <h1 className="job-detail-title">{job.title}</h1>
                    <span className="job-detail-company">{job.company}</span>
                  </div>
                </div>

                <div className="job-meta-chips">
                  <span className="meta-chip"><MapPin size={15} /> {job.location}</span>
                  <span className="meta-chip"><Briefcase size={15} /> {job.jobType || job.type} ({job.workMode || job.workplace})</span>
                  <span className="meta-chip stipend-chip"><DollarSign size={15} /> {job.salary || job.stipend}</span>
                  <span className="meta-chip"><Clock size={15} /> Posted {postedDate}</span>
                </div>
              </div>

              {/* Status Alert if closed / applied */}
              {hasApplied && (
                <div style={{
                  backgroundColor: 'var(--success-bg, #dcfce7)',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem'
                }}>
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>Application Submitted:</strong> You have an active application for this role. You can track recruiter review status in your <Link to="/applications" style={{ textDecoration: 'underline', fontWeight: 700 }}>Applications Portal</Link>.
                  </div>
                </div>
              )}

              {isClosed && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem'
                }}>
                  <AlertCircle size={20} />
                  <div>
                    <strong>Position Closed:</strong> This opportunity has concluded its recruitment cycle or deadline.
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="job-card-section">
                <h3 className="section-title-sm">Role Overview & Mission</h3>
                <p style={{ lineHeight: 1.7, color: 'var(--slate-700)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="job-card-section">
                  <h3 className="section-title-sm">Key Responsibilities</h3>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7, color: 'var(--slate-700)', fontSize: '0.95rem' }}>
                    {job.responsibilities.map((resp, i) => (
                      <li key={i} style={{ marginBottom: '0.4rem' }}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required & Preferred Skills */}
              <div className="job-card-section">
                <h3 className="section-title-sm">Required Technical Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {(job.requiredSkills || job.tags || []).map((skill, i) => (
                    <span key={i} className="job-skill-tag" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {job.preferredSkills && job.preferredSkills.length > 0 && (
                  <>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Preferred Skills (Bonus)</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {job.preferredSkills.map((skill, i) => (
                        <span key={i} className="job-skill-tag" style={{ background: 'var(--blue-50)', color: 'var(--blue-800)', border: '1px solid var(--blue-200)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Qualifications & Experience */}
              <div className="job-card-section">
                <h3 className="section-title-sm">Eligibility & Qualifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Target Experience</span>
                    <strong style={{ color: 'var(--navy-900)' }}>{job.experience || 'Fresher / Entry Level'}</strong>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Open Positions</span>
                    <strong style={{ color: 'var(--navy-900)' }}>{job.openings || 1} Openings</strong>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Application Deadline</span>
                    <strong style={{ color: 'var(--navy-900)' }}>{deadline}</strong>
                  </div>
                </div>
              </div>

              {/* Similar Opportunities */}
              {similarJobs && similarJobs.length > 0 && (
                <div className="job-card-section">
                  <h3 className="section-title-sm">Similar Recommended Opportunities</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    {similarJobs.map((sim) => (
                      <div
                        key={sim._id || sim.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          background: 'var(--bg-surface-subtle)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)', display: 'block' }}>{sim.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{sim.company} • {sim.location} • {sim.jobType}</span>
                        </div>
                        <Link to={`/jobs/${sim._id || sim.id}`}>
                          <Button variant="secondary" size="sm">View Role</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Sidebar */}
            <div className="job-details-sidebar">
              <div className="action-card-sticky">
                <div className="apply-box">
                  <h3 className="apply-box-title">Apply for this Opportunity</h3>
                  <p className="apply-box-sub">
                    Direct campus placement application. Verified responses are sent directly to recruiting coordinators.
                  </p>

                  <div className="apply-cta-stack">
                    {hasApplied ? (
                      <Link to="/applications" style={{ display: 'block' }}>
                        <Button variant="outline" size="lg" fullWidth icon={CheckCircle2}>
                          View Application Status
                        </Button>
                      </Link>
                    ) : isClosed ? (
                      <Button variant="secondary" size="lg" fullWidth disabled>
                        Applications Closed
                      </Button>
                    ) : (
                      <Button
                        variant="navy"
                        size="lg"
                        fullWidth
                        icon={Send}
                        onClick={handleApplyClick}
                      >
                        Apply Now
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      icon={Bookmark}
                      onClick={handleToggleSave}
                    >
                      {isSaved ? 'Remove from Saved' : 'Save to Bookmarks'}
                    </Button>
                  </div>
                </div>

                {/* Company Info Box */}
                <div className="company-mini-box">
                  <h4 className="comp-mini-title">About {job.company}</h4>
                  <p className="comp-mini-desc">
                    Verified partner organization recruiting directly through SkillBridge campus talent network.
                  </p>
                  <div className="comp-mini-stats">
                    <div className="mini-stat">
                      <Users size={14} />
                      <span>Hiring Batch: 2025 – 2026</span>
                    </div>
                    <div className="mini-stat">
                      <ShieldCheck size={14} />
                      <span>Verified Recruiter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        <ApplicationModal
          isOpen={isApplyingModal}
          onClose={() => setIsApplyingModal(false)}
          job={job}
          onApplicationSuccess={() => {
            setHasApplied(true);
            fetchJobDetails();
          }}
        />
      </div>
    </PublicLayout>
  );
};

export default JobDetailsPage;
