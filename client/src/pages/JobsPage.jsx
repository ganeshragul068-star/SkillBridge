import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import PageHeader from '../components/common/PageHeader';
import JobCard from '../components/common/JobCard';
import FormInput from '../components/common/FormInput';
import SelectField from '../components/common/SelectField';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ApplicationModal from '../components/jobs/ApplicationModal';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import jobService from '../services/jobService';
import savedJobService from '../services/savedJobService';
import { sampleJobs } from '../data/mockData';
import './JobsPage.css';

const jobTypeOptions = ['All', 'Internship', 'Full-time', 'Part-time'];
const workModeOptions = ['All', 'Remote', 'Hybrid', 'On-site'];
const sortOptions = [
  { label: 'Newest Postings', value: 'newest' },
  { label: 'Upcoming Deadline', value: 'deadline' },
  { label: 'Most Openings', value: 'openings' }
];

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states synced with URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'All');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        jobType: jobType !== 'All' ? jobType : undefined,
        workMode: workMode !== 'All' ? workMode : undefined,
        location: location || undefined,
        skill: skill || undefined,
        sort,
        page,
        limit: 9
      };

      const res = await jobService.getJobs(params);
      if (res && res.data) {
        setJobs(res.data);
        setTotalCount(res.total || res.data.length);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      // Fallback to sampleJobs if server offline
      setJobs(sampleJobs);
      setTotalCount(sampleJobs.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Sync to URL query parameters
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (jobType !== 'All') params.jobType = jobType;
    if (workMode !== 'All') params.workMode = workMode;
    if (location) params.location = location;
    if (skill) params.skill = skill;
    if (sort !== 'newest') params.sort = sort;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [searchTerm, jobType, workMode, location, skill, sort, page]);

  const handleApplyClick = (job) => {
    if (!user) {
      showToast('Please log in as a student to submit job applications.', 'info');
      return;
    }
    if (user.role === 'admin') {
      showToast('Administrators manage jobs but do not submit student applications.', 'info');
      return;
    }
    setApplyingJob(job);
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      showToast('Please sign in to bookmark opportunities.', 'info');
      return;
    }

    try {
      const target = jobs.find((j) => (j._id || j.id) === jobId);
      if (target?.isSaved) {
        await savedJobService.removeSavedJob(jobId);
        showToast('Removed from saved bookmarks.', 'info');
      } else {
        await savedJobService.saveJob(jobId);
        showToast('Saved to your bookmarks!', 'success');
      }
      fetchJobs();
    } catch (err) {
      showToast(err.message || 'Bookmark action failed.', 'error');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setJobType('All');
    setWorkMode('All');
    setLocation('');
    setSkill('');
    setSort('newest');
    setPage(1);
  };

  return (
    <PublicLayout>
      <div className="jobs-page-root" style={{ paddingBottom: '4rem' }}>
        <div className="container">
          <PageHeader
            title="Verified Jobs & Internships"
            description="Explore entry-level engineering opportunities and high-growth internships verified for college students and graduates."
            badge={`${totalCount} Positions Available`}
            isPhase1Preview={false}
          />

          {/* Search & Filter Toolbar */}
          <div className="jobs-filter-bar">
            <div className="search-box-flex">
              <FormInput
                placeholder="Search job title, company, or skills (e.g. React, Node, Python)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                icon={Search}
              />
            </div>

            <div className="filter-dropdowns">
              <div className="filter-item">
                <SelectField
                  options={workModeOptions}
                  value={workMode}
                  onChange={(e) => {
                    setWorkMode(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Work Mode"
                />
              </div>

              <div className="filter-item">
                <SelectField
                  options={jobTypeOptions}
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Job Type"
                />
              </div>

              <div className="filter-item">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="select-field"
                  style={{
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    padding: '0 0.75rem',
                    backgroundColor: '#ffffff',
                    fontSize: '0.85rem'
                  }}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || jobType !== 'All' || workMode !== 'All' || location || skill || sort !== 'newest') && (
                <Button variant="ghost" size="sm" onClick={resetFilters} icon={RefreshCw}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <LoadingState text="Fetching verified job opportunities..." />
          ) : jobs.length > 0 ? (
            <>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id || job.id}
                    job={job}
                    onApply={() => handleApplyClick(job)}
                    onToggleSave={() => handleToggleSave(job._id || job.id)}
                    isSaved={job.isSaved}
                    hasApplied={job.hasApplied}
                  />
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--slate-600)', fontWeight: 600 }}>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronRight}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No positions match your search criteria"
              description="Try adjusting your keyword query, workplace mode, or resetting all active filters."
              action={
                <Button variant="navy" size="sm" onClick={resetFilters}>
                  Clear All Filters
                </Button>
              }
            />
          )}
        </div>

        {/* Application Modal */}
        <ApplicationModal
          isOpen={Boolean(applyingJob)}
          onClose={() => setApplyingJob(null)}
          job={applyingJob}
          onApplicationSuccess={() => fetchJobs()}
        />
      </div>
    </PublicLayout>
  );
};

export default JobsPage;
