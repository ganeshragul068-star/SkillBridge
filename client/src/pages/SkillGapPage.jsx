import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Target, Sparkles, BookOpen, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import MatchPercentageCard from '../components/matching/MatchPercentageCard';
import MatchedSkillsList from '../components/matching/MatchedSkillsList';
import MissingSkillsList from '../components/matching/MissingSkillsList';
import SkillGapChart from '../components/matching/SkillGapChart';
import RecommendedCourseCard from '../components/matching/RecommendedCourseCard';
import matchingService from '../services/matchingService';
import { useToast } from '../hooks/useToast';

const SkillGapPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const queryJobId = searchParams.get('jobId');

  const [availableRoles, setAvailableRoles] = useState([
    'Full Stack MERN Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Analyst',
    'Mobile App Developer'
  ]);

  const [selectedRole, setSelectedRole] = useState('Full Stack MERN Developer');
  const [activeJobId, setActiveJobId] = useState(queryJobId || null);
  const [analysisData, setAnalysisData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSkillGap = async () => {
    try {
      setLoading(true);
      let res;
      if (activeJobId) {
        res = await matchingService.getJobSkillGap(activeJobId);
        if (res?.data) {
          setAnalysisData(res.data.skillGap);
          setCourses(res.data.recommendedCourses || []);
        }
      } else {
        res = await matchingService.getRoleSkillGap(selectedRole);
        if (res?.data) {
          setAnalysisData(res.data.skillGap);
          setCourses(res.data.recommendedCourses || []);
          if (res.data.availableRoles) {
            setAvailableRoles(res.data.availableRoles);
          }
        }
      }
    } catch (error) {
      showToast(error.message || 'Failed to calculate skill gap', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGap();
  }, [selectedRole, activeJobId]);

  const handleGenerateRoadmap = async () => {
    try {
      showToast('Generating personalized learning roadmap...', 'info');
      await matchingService.createRoadmap({
        targetRole: activeJobId ? undefined : selectedRole,
        jobId: activeJobId || undefined
      });
      showToast('Roadmap generated! Redirecting to your learning roadmap...', 'success');
      navigate('/roadmap');
    } catch (err) {
      showToast(err.message || 'Could not generate roadmap', 'error');
    }
  };

  return (
    <DashboardLayout pageTitle="Skill-Gap Analysis">
      <PageHeader
        title="Skill-Gap Analysis Engine"
        description="Data-driven gap diagnostics identifying exactly what competencies you need to attain your target career role or internship."
        badge="Phase 6 Intelligence"
      />

      {/* Target Selector Card */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, var(--navy-900, #0f172a), var(--navy-800, #1e293b))',
          color: '#ffffff'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan, #06b6d4)', fontWeight: 700, letterSpacing: '0.05em' }}>
            Analysis Target
          </span>
          <h2 style={{ margin: '0.25rem 0', fontSize: '1.25rem', color: '#ffffff' }}>
            {activeJobId ? `Target Job Opportunity (${activeJobId.substring(0, 8)}...)` : `Target Role: ${selectedRole}`}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            {activeJobId
              ? 'Analyzing required qualifications specified by the employer.'
              : 'Benchmarking your profile against industry standard curriculum.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {activeJobId ? (
            <button
              type="button"
              onClick={() => setActiveJobId(null)}
              style={{
                padding: '0.5rem 0.9rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer'
              }}
            >
              Switch to Standard Roles
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Select Target Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: '#ffffff',
                  color: 'var(--navy-900, #0f172a)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={fetchSkillGap}
            title="Refresh Analysis"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Calculating skill gap and generating recommendations...</p>
        </div>
      ) : analysisData ? (
        <>
          {/* Top Score Banner */}
          <div style={{ marginBottom: '1.75rem' }}>
            <MatchPercentageCard
              percentage={analysisData.matchPercentage}
              tier={analysisData.matchTier}
              matchedCount={analysisData.matchedCount}
              totalRequired={analysisData.totalRequired}
              title={`Readiness for ${analysisData.targetName}`}
              subtitle="Skills verified through assessments and self-reported competencies"
            />
          </div>

          {/* Matrix & Breakdown Grid */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Matched Skills Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
                  ✅ Matched Skills ({analysisData.matchedSkills.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                  Assessment verified competencies highlighted
                </span>
              </div>
              <MatchedSkillsList matchedSkills={analysisData.matchedSkills} />
            </div>

            {/* Missing Skills Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
                  ⚠️ Competency Gaps ({analysisData.missingSkills.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                  Prioritized by foundational dependency
                </span>
              </div>
              <MissingSkillsList
                missingSkills={analysisData.missingSkills}
                onAddToRoadmap={(skillName) => {
                  showToast(`Added ${skillName} to learning roadmap!`, 'success');
                  navigate('/roadmap');
                }}
              />
            </div>
          </div>

          {/* Requirement Coverage Breakdown Chart */}
          <div style={{ marginBottom: '2rem' }}>
            <SkillGapChart
              matchedSkills={analysisData.matchedSkills}
              missingSkills={analysisData.missingSkills}
              percentage={analysisData.matchPercentage}
            />
          </div>

          {/* Learning Roadmap CTA Banner */}
          <div
            className="card"
            style={{
              marginBottom: '2rem',
              backgroundColor: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1.5rem'
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e3a8a', fontSize: '1.1rem' }}>
                🗺️ Personalized Learning Roadmap Available
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af' }}>
                Convert these {analysisData.missingSkills.length} missing skills into an ordered, step-by-step curriculum with foundational milestones.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateRoadmap}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'var(--navy-900, #0f172a)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Generate Learning Roadmap <ArrowRight size={15} />
            </button>
          </div>

          {/* Recommended Courses Section */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900, #0f172a)' }}>
                  📚 Curated Courses to Close Your Gaps
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500, #64748b)' }}>
                  Selected from active catalogs addressing your missing competencies
                </span>
              </div>
              <Link to="/courses" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                View All Courses →
              </Link>
            </div>

            {courses.length === 0 ? (
              <div
                className="card"
                style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500, #64748b)' }}
              >
                <BookOpen size={32} style={{ margin: '0 auto 0.75rem auto', color: 'var(--slate-400, #94a3b8)' }} />
                <p>No active catalog courses currently address your specific missing skills.</p>
              </div>
            ) : (
              <div className="grid-3">
                {courses.map((course) => (
                  <RecommendedCourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
};

export default SkillGapPage;
