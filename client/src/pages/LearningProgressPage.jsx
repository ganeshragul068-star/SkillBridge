import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Plus,
  AlertCircle,
  Trash2,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import ProficiencyBadge from '../components/assessments/ProficiencyBadge';
import progressService from '../services/progressService';
import { useToast } from '../hooks/useToast';

const LearningProgressPage = () => {
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newSkill, setNewSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Beginner');
  const [targetLevel, setTargetLevel] = useState('Advanced');
  const [initialProgress, setInitialProgress] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await progressService.getProgressDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load learning progress dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      showToast('Please enter a skill name', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await progressService.createProgress({
        skill: newSkill.trim(),
        currentLevel,
        targetLevel,
        progressPercentage: Number(initialProgress) || 0
      });
      showToast(`Started tracking progress for ${newSkill.trim()}!`, 'success');
      setNewSkill('');
      setShowAddModal(false);
      fetchDashboardData();
    } catch (error) {
      showToast(error.message || 'Failed to initialize progress', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePercentage = async (id, newPct) => {
    try {
      await progressService.updateProgress(id, { progressPercentage: newPct });
      showToast('Progress updated', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast(error.message || 'Failed to update progress', 'error');
    }
  };

  const handleCompleteCourse = async (progressId, courseId) => {
    try {
      await progressService.updateProgress(progressId, { courseToComplete: courseId });
      showToast('Course marked as completed!', 'success');
      fetchDashboardData();
    } catch (error) {
      showToast(error.message || 'Failed to update course status', 'error');
    }
  };

  const handleDeleteProgress = async (id) => {
    try {
      await progressService.deleteProgress(id);
      showToast('Learning progress record removed', 'info');
      fetchDashboardData();
    } catch (error) {
      showToast(error.message || 'Failed to remove record', 'error');
    }
  };

  return (
    <DashboardLayout pageTitle="Learning Progress Analytics">
      <PageHeader
        title="Learning Progress & Competency Analytics"
        description="Monitor active skill study roadmaps, course completion milestones, and diagnostic performance trends."
        badge="Phase 7 Learning Analytics"
      />

      {/* Top 4 Real MongoDB Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Skills Being Learned"
          value={(dashboardData?.totalSkillsBeingLearned || 0).toString()}
          subtitle="Active competencies"
          icon={TrendingUp}
          variant="blue"
        />
        <StatCard
          title="Courses Completed"
          value={(dashboardData?.coursesCompletedCount || 0).toString()}
          subtitle="Curriculum finished"
          icon={CheckCircle}
          variant="emerald"
        />
        <StatCard
          title="Courses In Progress"
          value={(dashboardData?.coursesInProgressCount || 0).toString()}
          subtitle="Currently enrolled"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Overall Progress"
          value={`${dashboardData?.overallLearningProgress || 0}%`}
          subtitle="Readiness across all skills"
          icon={Award}
          variant="navy"
        />
      </div>

      {/* Controls Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900, #0f172a)' }}>
            Active Skill Roadmaps ({dashboardData?.progressRecords?.length || 0})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
            Target proficiency milestones and real-time MongoDB progress
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={fetchDashboardData}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              border: '1px solid var(--slate-300, #cbd5e1)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Plus size={15} /> Track New Skill
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Skill Cards List */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <p>Loading your learning analytics...</p>
            </div>
          ) : !dashboardData?.progressRecords?.length ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500, #64748b)' }}>
              <TrendingUp size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--slate-400, #94a3b8)' }} />
              <p>No active skill trackers. Click "Track New Skill" to start your learning journey.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {dashboardData.progressRecords.map((prog) => (
                <div
                  key={prog._id}
                  className="card"
                  style={{
                    padding: '1.35rem',
                    borderRadius: 'var(--radius-lg, 12px)'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--navy-900, #0f172a)' }}>
                          {prog.skill}
                        </h3>
                        <ProficiencyBadge level={prog.currentLevel} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
                        Target Goal: <strong>{prog.targetLevel}</strong> • Last Updated: {new Date(prog.lastUpdated || prog.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProgress(prog._id)}
                      title="Delete record"
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--slate-400, #94a3b8)',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Progress Bar & Slider */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--slate-700, #334155)' }}>Competency Progress</span>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>{prog.progressPercentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          width: `${prog.progressPercentage}%`,
                          height: '100%',
                          backgroundColor: prog.progressPercentage === 100 ? '#16a34a' : '#2563eb',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    {/* Quick percentage buttons */}
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {[25, 50, 75, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleUpdatePercentage(prog._id, val)}
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: prog.progressPercentage === val ? '#2563eb' : '#f8fafc',
                            color: prog.progressPercentage === val ? '#fff' : '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Related Recommended Courses */}
                  {Array.isArray(prog.recommendedCourses) && prog.recommendedCourses.length > 0 && (
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100, #f1f5f9)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500, #64748b)', textTransform: 'uppercase' }}>
                        Curated Learning Courses:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.35rem' }}>
                        {prog.recommendedCourses.map((c) => {
                          const isDone = Array.isArray(prog.completedCourses) && prog.completedCourses.some((cc) => (cc._id || cc).toString() === c._id.toString());

                          return (
                            <div
                              key={c._id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.4rem 0.65rem',
                                backgroundColor: isDone ? '#f0fdf4' : '#f8fafc',
                                border: `1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'}`,
                                borderRadius: 'var(--radius-sm, 6px)',
                                fontSize: '0.8rem'
                              }}
                            >
                              <span>
                                <strong>{c.title}</strong> <span style={{ color: '#64748b' }}>({c.provider})</span>
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isDone ? (
                                  <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.725rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <CheckCircle size={13} /> Completed
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCompleteCourse(prog._id, c._id)}
                                    style={{
                                      fontSize: '0.725rem',
                                      fontWeight: 600,
                                      padding: '0.2rem 0.45rem',
                                      borderRadius: '4px',
                                      backgroundColor: '#eff6ff',
                                      color: '#2563eb',
                                      border: '1px solid #bfdbfe',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Mark Done
                                  </button>
                                )}
                                {c.courseUrl && (
                                  <a href={c.courseUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b' }}>
                                    <ExternalLink size={13} />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Skills Requiring Improvement & Assessment Performance Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Skills Requiring Improvement */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertCircle size={18} color="#d97706" />
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-900, #0f172a)' }}>
                Skills Requiring Focus
              </h4>
            </div>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.825rem', color: 'var(--slate-600, #475569)', lineHeight: 1.4 }}>
              Competencies currently under 60% progress or classified as Beginner.
            </p>

            {dashboardData?.skillsRequiringImprovement?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {dashboardData.skillsRequiringImprovement.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 'var(--radius-sm, 6px)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900, #0f172a)', display: 'block' }}>
                        {s.skill}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#b45309' }}>
                        Level: {s.currentLevel} → {s.targetLevel}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#d97706' }}>
                      {s.progressPercentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.825rem', color: '#16a34a' }}>
                ✓ All active skills exceed 60% progress milestone!
              </span>
            )}
          </div>

          {/* Assessment Performance Trends */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Award size={18} color="#2563eb" />
              <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy-900, #0f172a)' }}>
                Diagnostic Test Trends
              </h4>
            </div>

            {dashboardData?.assessmentTrends?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {dashboardData.assessmentTrends.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm, 6px)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900, #0f172a)', display: 'block' }}>
                        {t.skill}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                        {t.proficiencyLevel} • {new Date(t.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: t.passed ? '#16a34a' : '#dc2626'
                      }}
                    >
                      {t.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '0.825rem', color: 'var(--slate-500, #64748b)' }}>
                No diagnostic assessments taken yet.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '440px',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--navy-900, #0f172a)' }}>
              Track New Skill
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--slate-600, #475569)' }}>
              Set your starting level and target goal to begin tracking progress in MongoDB.
            </p>

            <form onSubmit={handleAddProgress}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Skill Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Docker, TypeScript, GraphQL"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.9rem'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Current Level
                  </label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Target Goal
                  </label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Track Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearningProgressPage;
