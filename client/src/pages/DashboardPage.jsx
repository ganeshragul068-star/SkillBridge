import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Bookmark,
  Send,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/common/StatCard';
import RecommendedJobCard from '../components/matching/RecommendedJobCard';
import ProgressTracker from '../components/matching/ProgressTracker';
import RecommendedCourseCard from '../components/matching/RecommendedCourseCard';
import ProfileCompletionCard from '../components/profile/ProfileCompletionCard';
import ApplicationModal from '../components/jobs/ApplicationModal';
import Button from '../components/common/Button';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import profileService from '../services/profileService';
import jobService from '../services/jobService';
import applicationService from '../services/applicationService';
import savedJobService from '../services/savedJobService';
import matchingService from '../services/matchingService';
import assessmentService from '../services/assessmentService';
import progressService from '../services/progressService';
import ProficiencyBadge from '../components/assessments/ProficiencyBadge';
import { studentProfile } from '../data/mockData';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState({
    studentName: user?.name || studentProfile.name,
    targetRole: user?.profile?.department ? `${user.profile.department} Specialist` : 'Full Stack MERN Developer',
    college: user?.profile?.college || studentProfile.college,
    graduationYear: user?.profile?.graduationYear || studentProfile.graduationYear,
    totalSkills: 0,
    totalProjects: 0,
    totalCertifications: 0,
    totalEducation: 0,
    completion: {
      completionPercentage: 0,
      completedSections: [],
      incompleteSections: []
    },
    recentActivity: []
  });

  // Real job & application metrics
  const [totalJobsAvailable, setTotalJobsAvailable] = useState(0);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [applyingJob, setApplyingJob] = useState(null);

  // Phase 6 & 7 State
  const [matchingSummary, setMatchingSummary] = useState(null);
  const [topRecommendedJobs, setTopRecommendedJobs] = useState([]);
  const [roadmapSummary, setRoadmapSummary] = useState(null);
  const [dashboardCourses, setDashboardCourses] = useState([]);
  const [latestAssessmentResults, setLatestAssessmentResults] = useState([]);
  const [learningAnalytics, setLearningAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAllDashboardMetrics = async () => {
    try {
      setLoading(true);

      const [
        profileRes,
        jobsRes,
        appsRes,
        savedRes,
        matchSumRes,
        matchJobsRes,
        roadmapRes,
        coursesRes,
        assessResultsRes,
        progressDashRes
      ] = await Promise.allSettled([
        profileService.getProfileStats(),
        jobService.getJobs({ limit: 4 }),
        applicationService.getMyApplications(),
        savedJobService.getMySavedJobs(),
        matchingService.getMatchingSummary(),
        matchingService.getMatchingJobs({ sort: 'match' }),
        matchingService.getRoadmap(),
        matchingService.getCourseRecommendations('Full Stack MERN Developer'),
        assessmentService.getMyAssessmentResults(),
        progressService.getProgressDashboard()
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        setStats((prev) => ({
          ...prev,
          ...profileRes.value.data,
          studentName: profileRes.value.data.studentName || user?.name || prev.studentName,
          targetRole: profileRes.value.data.targetRole || prev.targetRole,
          college: profileRes.value.data.college || prev.college
        }));
      }

      if (jobsRes.status === 'fulfilled' && jobsRes.value?.data) {
        setTotalJobsAvailable(jobsRes.value.total || jobsRes.value.data.length);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
        const apps = appsRes.value.data;
        setMyApplications(apps);
        const sl = apps.filter((a) => a.status === 'Shortlisted' || a.status === 'Selected').length;
        setShortlistedCount(sl);
      }

      if (savedRes.status === 'fulfilled' && savedRes.value?.data) {
        setSavedJobsCount(savedRes.value.data.length);
      }

      // Phase 6 Matching summary
      if (matchSumRes.status === 'fulfilled' && matchSumRes.value?.data) {
        setMatchingSummary(matchSumRes.value.data);
      }

      // Phase 6 Top 3 matched jobs with real explainable scores
      if (matchJobsRes.status === 'fulfilled' && matchJobsRes.value?.data) {
        setTopRecommendedJobs(matchJobsRes.value.data.slice(0, 3));
      }

      // Phase 6 Roadmap progress
      if (roadmapRes.status === 'fulfilled' && roadmapRes.value?.data) {
        setRoadmapSummary(roadmapRes.value.data);
      }

      // Phase 6 Recommended courses
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
        setDashboardCourses(coursesRes.value.data.slice(0, 3));
      }

      // Phase 7 Assessment results
      if (assessResultsRes.status === 'fulfilled' && assessResultsRes.value?.data) {
        setLatestAssessmentResults(assessResultsRes.value.data.slice(0, 3));
      }

      // Phase 7 Learning analytics
      if (progressDashRes.status === 'fulfilled' && progressDashRes.value?.data) {
        setLearningAnalytics(progressDashRes.value.data);
      }
    } catch (_) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDashboardMetrics();
  }, [user]);

  const firstName = stats.studentName.split(' ')[0] || 'Student';
  const initials = stats.studentName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const completionPct = stats.completion?.completionPercentage ?? 0;

  return (
    <DashboardLayout pageTitle="Student Dashboard">
      <div className="dashboard-content-wrapper" style={{ paddingBottom: '3rem' }}>
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>Welcome back, {firstName}! 👋</h2>
            <p>
              Your target career path is <strong>{stats.targetRole}</strong> at <strong>{stats.college}</strong>. You have <strong>{shortlistedCount} active interview shortlist{shortlistedCount === 1 ? '' : 's'}</strong> and <strong>{totalJobsAvailable} verified job openings</strong> ready for review.
            </p>
          </div>
          <div className="welcome-actions">
            <Link to="/matching">
              <Button variant="navy" size="sm" icon={Sparkles}>
                Smart Matches ({matchingSummary?.averageMatchPercentage || 0}% Avg)
              </Button>
            </Link>
            <Link to="/applications">
              <Button variant="secondary" size="sm" icon={Send}>
                My Applications ({myApplications.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* Phase 6 Live Recommendations Strip */}
        <div className="prototype-badge-strip">
          <Sparkles size={16} />
          <span>
            <strong>Phase 6 Intelligence:</strong> Dynamic job-skill matching ({matchingSummary?.averageMatchPercentage || 0}% Avg), verified assessment badges, and personalized learning roadmap for <strong>{stats.studentName}</strong>.
          </span>
        </div>

        {/* 4 Real Opportunity & Application Summary Stat Cards */}
        <div className="grid-4 stats-grid">
          <StatCard
            title="Avg Job Match"
            value={`${matchingSummary?.averageMatchPercentage || 0}%`}
            subtitle={`${matchingSummary?.tierCounts?.Excellent || 0} Excellent matches`}
            icon={TrendingUp}
            variant="blue"
          />
          <StatCard
            title="Roadmap Progress"
            value={`${roadmapSummary?.completionPercentage || 0}%`}
            subtitle={`${roadmapSummary?.completedCount || 0} of ${roadmapSummary?.totalSteps || 0} steps done`}
            icon={Compass}
            variant="emerald"
          />
          <StatCard
            title="Applications Sent"
            value={myApplications.length.toString()}
            subtitle={`${shortlistedCount} shortlisted`}
            icon={Send}
            variant="navy"
          />
          <StatCard
            title="Saved Shortlist"
            value={savedJobsCount.toString()}
            subtitle="Positions bookmarked"
            icon={Bookmark}
            variant="amber"
          />
        </div>

        {/* Dynamic Profile Completion Details */}
        <ProfileCompletionCard completion={stats.completion} />

        {/* Phase 6 Roadmap Progress Banner */}
        {roadmapSummary && (
          <div style={{ marginBottom: '2rem' }}>
            <ProgressTracker
              completed={roadmapSummary.completedCount || 0}
              total={roadmapSummary.totalSteps || 0}
              percentage={roadmapSummary.completionPercentage || 0}
              title={`Personalized Learning Roadmap: ${roadmapSummary.targetRole}`}
              subtitle="Foundational skills to close your employability gap"
            />
          </div>
        )}

        {/* Main Dashboard Two-Column Grid */}
        <div className="dashboard-grid-2">
          {/* Left Column: Top 3 Recommended Opportunities & Application Pipeline */}
          <div className="dashboard-col-main">
            {/* Top 3 Smart Recommended Opportunities */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">Top Recommended Opportunities (Smart Match)</h3>
                  <p className="dash-card-sub">Ranked in descending order of skill match percentage</p>
                </div>
                <Link to="/matching" className="view-all-link">
                  View All Matches <ArrowRight size={14} />
                </Link>
              </div>

              {topRecommendedJobs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  {topRecommendedJobs.map((job) => (
                    <RecommendedJobCard
                      key={job._id || job.id}
                      job={job}
                      onApply={() => setApplyingJob(job)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                  <p>No job matches found. Update your profile skills to generate recommendations.</p>
                  <Link to="/skills">
                    <Button variant="navy" size="sm" style={{ marginTop: '0.5rem' }}>
                      Add Skills
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Application Pipeline Overview */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">Recent Application Pipeline</h3>
                  <p className="dash-card-sub">Real-time status updates from campus placement coordinators</p>
                </div>
                <Link to="/applications" className="view-all-link">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {myApplications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {myApplications.slice(0, 3).map((app) => (
                    <div
                      key={app._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)', display: 'block' }}>
                          {app.jobId?.title || 'Engineering Role'}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {app.jobId?.company} • Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            app.status === 'Shortlisted' || app.status === 'Selected'
                              ? '#dcfce7'
                              : app.status === 'Under Review'
                              ? '#fef3c7'
                              : '#dbeafe',
                          color:
                            app.status === 'Shortlisted' || app.status === 'Selected'
                              ? '#15803d'
                              : app.status === 'Under Review'
                              ? '#b45309'
                              : '#1e3a8a',
                          fontWeight: 700
                        }}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                  <p>You have not applied for any positions yet.</p>
                  <Link to="/jobs">
                    <Button variant="navy" size="sm" icon={Send} style={{ marginTop: '0.5rem' }}>
                      Apply for Your First Position
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Phase 7: Latest Diagnostic Assessments & Verified Competencies */}
            <div className="dash-card">
              <div className="dash-card-header">
                <div>
                  <h3 className="dash-card-title">Latest Diagnostic Assessments</h3>
                  <p className="dash-card-sub">Verified technical competencies and recent test results</p>
                </div>
                <Link to="/assessments" className="view-all-link">
                  Take Assessments <ArrowRight size={14} />
                </Link>
              </div>

              {latestAssessmentResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {latestAssessmentResults.map((r) => (
                    <div
                      key={r._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 1rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: `1.5px solid ${r.passed ? '#bbf7d0' : '#fecaca'}`
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.925rem', color: 'var(--navy-900)' }}>
                            {r.assessmentId?.title || r.assessmentId?.skill || 'Technical Assessment'}
                          </strong>
                          <ProficiencyBadge level={r.proficiencyLevel} />
                        </div>
                        <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>
                          Completed on {new Date(r.completedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: r.passed ? '#16a34a' : '#dc2626' }}>
                          {r.percentage}%
                        </span>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                          {r.score} / {r.totalMarks} Marks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                  <Award size={28} style={{ margin: '0 auto 0.5rem auto', color: 'var(--slate-400)' }} />
                  <p>No assessment attempts completed yet. Take an assessment to verify skills on your profile.</p>
                  <Link to="/assessments">
                    <Button variant="navy" size="sm" style={{ marginTop: '0.5rem' }}>
                      Start First Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Profile Summary & Skill Gap Quick Access */}
          <div className="dashboard-col-side">
            {/* Quick Profile Summary */}
            <div className="dash-card profile-quick-card">
              <div className="profile-top">
                <div className="profile-big-avatar">{initials}</div>
                <h3 className="profile-full-name">{stats.studentName}</h3>
                <span className="profile-role-tag">{stats.targetRole}</span>
                <p className="profile-college-name">{stats.college}</p>
              </div>

              <div className="profile-stats-row">
                <div className="p-stat">
                  <span className="p-stat-val">{stats.totalSkills}</span>
                  <span className="p-stat-lbl">Skills</span>
                </div>
                <div className="p-stat">
                  <span className="p-stat-val">{stats.totalProjects}</span>
                  <span className="p-stat-lbl">Projects</span>
                </div>
                <div className="p-stat">
                  <span className="p-stat-val">{completionPct}%</span>
                  <span className="p-stat-lbl">Completed</span>
                </div>
              </div>

              <Link to="/profile" style={{ display: 'block', marginTop: '1rem' }}>
                <Button variant="outline" size="sm" fullWidth>
                  Manage Full Profile
                </Button>
              </Link>
            </div>

            {/* Quick Skill-Gap Card */}
            <div className="dash-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Target size={18} color="#2563eb" />
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-900)' }}>
                  Skill-Gap Intelligence
                </h4>
              </div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                Identify exactly which technical skills are missing for your target career role.
              </p>
              {matchingSummary?.topMissingSkills && matchingSummary.topMissingSkills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                    Top In-Demand Gaps:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {matchingSummary.topMissingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}
                      >
                        {s.name} ({s.count} jobs)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Link to="/skill-gap" style={{ textDecoration: 'none' }}>
                <Button variant="navy" size="sm" fullWidth icon={ArrowRight}>
                  Run Skill Gap Diagnostics
                </Button>
              </Link>
            </div>

            {/* Recommended Learning Courses */}
            {dashboardCourses.length > 0 && (
              <div className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} color="#16a34a" />
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-900)' }}>
                      Curated Courses
                    </h4>
                  </div>
                  <Link to="/courses" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                    View All →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardCourses.map((c) => (
                    <div
                      key={c._id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-sm, 6px)'
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900)', display: 'block' }}>
                        {c.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {c.provider} • {c.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controlled Application Submission Modal */}
        {applyingJob && (
          <ApplicationModal
            job={applyingJob}
            onClose={() => setApplyingJob(null)}
            onApplicationSubmitted={() => {
              setApplyingJob(null);
              loadAllDashboardMetrics();
              showToast('Application successfully recorded in MongoDB!', 'success');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
