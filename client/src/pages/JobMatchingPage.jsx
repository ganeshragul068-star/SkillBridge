import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Filter, Briefcase, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import RecommendedJobCard from '../components/matching/RecommendedJobCard';
import matchingService from '../services/matchingService';
import { useToast } from '../hooks/useToast';

const JobMatchingPage = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match');

  const fetchMatchingData = async () => {
    try {
      setLoading(true);
      const [jobsRes, summaryRes] = await Promise.all([
        matchingService.getMatchingJobs({
          tier: selectedTier === 'All' ? undefined : selectedTier,
          search: searchQuery || undefined,
          sort: sortBy
        }),
        matchingService.getMatchingSummary()
      ]);

      if (jobsRes?.data) {
        setJobs(jobsRes.data);
      }
      if (summaryRes?.data) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      showToast(error.message || 'Could not load job matching intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchingData();
  }, [selectedTier, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMatchingData();
  };

  return (
    <DashboardLayout pageTitle="Smart Job Matching">
      <PageHeader
        title="Smart Job Matching & Recommendation Engine"
        description="Explainable match scores comparing your acquired skills directly with active opportunity requirements in MongoDB."
        badge="Phase 6 Recommendation Engine"
      />

      {/* Summary Metrics Cards */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Avg Match Score</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', color: 'var(--navy-900, #0f172a)' }}>
                {summary.averageMatchPercentage}%
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Excellent Matches (80%+)</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', color: 'var(--navy-900, #0f172a)' }}>
                {summary.tierCounts?.Excellent || 0} Jobs
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Good Matches (60-79%)</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', color: 'var(--navy-900, #0f172a)' }}>
                {summary.tierCounts?.Good || 0} Jobs
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#f8fafc', color: 'var(--navy-800, #1e293b)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>Active Opportunities</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', color: 'var(--navy-900, #0f172a)' }}>
                {summary.totalActiveJobs || 0}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
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
        {/* Tier Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'All Tiers', val: 'All' },
            { label: '🌟 Excellent (80-100%)', val: 'Excellent' },
            { label: '👍 Good (60-79%)', val: 'Good' },
            { label: '⚡ Moderate (40-59%)', val: 'Moderate' },
            { label: '🌱 Low (<40%)', val: 'Low' }
          ].map((tier) => (
            <button
              key={tier.val}
              type="button"
              onClick={() => setSelectedTier(tier.val)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid',
                borderColor: selectedTier === tier.val ? 'var(--navy-900, #0f172a)' : 'var(--slate-200, #e2e8f0)',
                backgroundColor: selectedTier === tier.val ? 'var(--navy-900, #0f172a)' : '#fff',
                color: selectedTier === tier.val ? '#fff' : 'var(--slate-700, #334155)',
                cursor: 'pointer'
              }}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.35rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400, #94a3b8)' }} />
              <input
                type="text"
                placeholder="Search matching jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--slate-300, #cbd5e1)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  width: '210px'
                }}
              />
            </div>
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
              Search
            </button>
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              border: '1px solid var(--slate-300, #cbd5e1)',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="match">Sort by: Highest Match</option>
            <option value="deadline">Sort by: Deadline</option>
            <option value="newest">Sort by: Newest</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Calculating smart job matches against your profile...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'var(--slate-600, #475569)'
          }}
        >
          <Briefcase size={36} color="var(--slate-400, #94a3b8)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--navy-900, #0f172a)' }}>
            No opportunities match this criteria
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--slate-500, #64748b)' }}>
            Try selecting "All Tiers", clearing your search keywords, or adding more technical skills to your profile.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setSelectedTier('All'); setSearchQuery(''); }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--slate-100, #f1f5f9)',
                border: '1px solid var(--slate-300, #cbd5e1)',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
            <Link
              to="/skills"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                backgroundColor: 'var(--navy-900, #0f172a)',
                color: '#fff',
                textDecoration: 'none'
              }}
            >
              Update Profile Skills
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {jobs.map((job) => (
            <RecommendedJobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobMatchingPage;
