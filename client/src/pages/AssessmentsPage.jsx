import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Search,
  Filter,
  Sparkles,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import AssessmentCard from '../components/assessments/AssessmentCard';
import InstructionModal from '../components/assessments/InstructionModal';
import ProficiencyBadge from '../components/assessments/ProficiencyBadge';
import assessmentService from '../services/assessmentService';
import { useToast } from '../hooks/useToast';

const AssessmentsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'history'
  const [assessments, setAssessments] = useState([]);
  const [historyResults, setHistoryResults] = useState([]);
  const [historySummary, setHistorySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-flight instruction modal
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const categories = [
    'All',
    'Programming Languages',
    'Frontend Development',
    'Backend Development',
    'Database',
    'Data Structures'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'available') {
        const res = await assessmentService.getAssessments({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
          search: searchQuery || undefined
        });
        if (res?.data) {
          setAssessments(res.data);
        }
      } else {
        const res = await assessmentService.getMyAssessmentResults();
        if (res?.data) {
          setHistoryResults(res.data);
          setHistorySummary(res.summary);
        }
      }
    } catch (error) {
      showToast(error.message || 'Failed to load assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleStartAttempt = () => {
    if (!selectedAssessment) return;
    navigate(`/assessments/take/${selectedAssessment._id}`);
  };

  return (
    <DashboardLayout pageTitle="Skill Assessment Dashboard">
      <PageHeader
        title="Skill Competency Assessments"
        description="Verify your technical capabilities through standardized assessments and earn profile badges."
        badge="Phase 7 Assessment Engine"
      />

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-200, #e2e8f0)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm, 6px)',
            border: 'none',
            backgroundColor: activeTab === 'available' ? 'var(--navy-900, #0f172a)' : 'transparent',
            color: activeTab === 'available' ? '#ffffff' : 'var(--slate-600, #475569)',
            cursor: 'pointer'
          }}
        >
          <Award size={16} /> Available Assessments ({assessments.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm, 6px)',
            border: 'none',
            backgroundColor: activeTab === 'history' ? 'var(--navy-900, #0f172a)' : 'transparent',
            color: activeTab === 'history' ? '#ffffff' : 'var(--slate-600, #475569)',
            cursor: 'pointer'
          }}
        >
          <History size={16} /> My Assessment History
        </button>
      </div>

      {activeTab === 'available' ? (
        <>
          {/* Filters Bar */}
          <div
            className="card"
            style={{
              marginBottom: '1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--navy-900, #0f172a)' : 'var(--slate-200, #e2e8f0)',
                    backgroundColor: selectedCategory === cat ? 'var(--navy-900, #0f172a)' : '#fff',
                    color: selectedCategory === cat ? '#fff' : 'var(--slate-700, #334155)',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Difficulty */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--slate-300, #cbd5e1)',
                  backgroundColor: '#fff'
                }}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Difficulties' : d}
                  </option>
                ))}
              </select>

              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.35rem' }}>
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    width: '180px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--slate-100, #f1f5f9)',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    cursor: 'pointer'
                  }}
                >
                  <Search size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Assessments Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <p>Loading available skill assessments...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500, #64748b)' }}
            >
              <Award size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--slate-400, #94a3b8)' }} />
              <p>No assessments match your selected filter criteria.</p>
            </div>
          ) : (
            <div className="grid-3">
              {assessments.map((a) => (
                <AssessmentCard
                  key={a._id}
                  assessment={a}
                  onStart={(ass) => setSelectedAssessment(ass)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Assessment History Tab */
        <div>
          {/* Summary Banner */}
          {historySummary && (
            <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
              <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Total Tests Taken</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: 'var(--navy-900, #0f172a)' }}>
                  {historySummary.totalAssessmentsTaken}
                </h3>
              </div>
              <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Verified Badges Earned</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: '#15803d' }}>
                  {historySummary.verifiedSkills?.length || 0}
                </h3>
              </div>
              <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Average Score</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', color: '#2563eb' }}>
                  {historySummary.averageScore}%
                </h3>
              </div>
            </div>
          )}

          {/* History Records Table / Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
              <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <p>Loading assessment history...</p>
            </div>
          ) : historyResults.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--slate-500, #64748b)' }}>
              <History size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--slate-400, #94a3b8)' }} />
              <p>You have not completed any skill assessments yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab('available')}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  backgroundColor: 'var(--navy-900, #0f172a)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Browse Assessments
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {historyResults.map((r) => (
                <div
                  key={r._id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.15rem 1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderLeft: `4px solid ${r.passed ? '#16a34a' : '#dc2626'}`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
                        {r.assessmentId?.title || 'Technical Assessment'}
                      </h4>
                      <ProficiencyBadge level={r.proficiencyLevel} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
                      {r.assessmentId?.skill} • Attempt #{r.attemptNumber || 1} • Completed on {new Date(r.completedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: r.passed ? '#16a34a' : '#dc2626' }}>
                        {r.percentage}%
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-500, #64748b)' }}>
                        {r.score} / {r.totalMarks} Marks
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/assessments/result/${r._id}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.95rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        backgroundColor: 'var(--slate-100, #f1f5f9)',
                        color: 'var(--slate-800, #1e293b)',
                        border: '1px solid var(--slate-300, #cbd5e1)',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Scorecard <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pre-flight Instruction Modal */}
      {selectedAssessment && (
        <InstructionModal
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          onConfirmStart={handleStartAttempt}
        />
      )}
    </DashboardLayout>
  );
};

export default AssessmentsPage;
