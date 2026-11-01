import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ExternalLink, Briefcase, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import JobCard from '../components/common/JobCard';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ApplicationModal from '../components/jobs/ApplicationModal';

import { useToast } from '../hooks/useToast';
import savedJobService from '../services/savedJobService';
import { sampleJobs } from '../data/mockData';

const SavedJobsPage = () => {
  const { showToast } = useToast();
  const [savedRecords, setSavedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await savedJobService.getMySavedJobs();
      if (res && res.data) {
        setSavedRecords(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Could not load saved bookmarks from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await savedJobService.removeSavedJob(jobId);
      showToast('Removed job from bookmarks.', 'info');
      setSavedRecords((prev) => prev.filter((r) => (r.jobId?._id || r.jobId) !== jobId));
    } catch (err) {
      showToast(err.message || 'Failed to remove bookmark.', 'error');
    }
  };

  return (
    <DashboardLayout pageTitle="Saved Opportunities">
      <div style={{ paddingBottom: '3rem' }}>
        <PageHeader
          title="Saved Jobs & Internships"
          description="Your personal shortlist of bookmarked opportunities. Review requirements and submit applications before deadlines expire."
          badge={`${savedRecords.length} Bookmarked`}
          isPhase1Preview={false}
          actions={
            <Link to="/jobs">
              <Button variant="navy" size="sm" icon={Plus}>
                Explore More Jobs
              </Button>
            </Link>
          }
        />

        {loading ? (
          <LoadingState text="Loading your bookmarked opportunities..." />
        ) : savedRecords.length > 0 ? (
          <div className="grid-2">
            {savedRecords.map((record) => {
              const job = record.jobId;
              if (!job) {
                return (
                  <div key={record._id} className="card" style={{ padding: '1.25rem', color: 'var(--slate-500)' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>This job posting has been archived or removed by campus admin.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleRemove(record.jobId)}
                      style={{ color: 'var(--danger)', marginTop: '0.5rem' }}
                    >
                      Remove Bookmark
                    </Button>
                  </div>
                );
              }

              const jobId = job._id || job.id;

              return (
                <div key={record._id} style={{ position: 'relative' }}>
                  <JobCard
                    job={job}
                    onApply={() => setApplyingJob(job)}
                    onToggleSave={() => handleRemove(jobId)}
                    isSaved={true}
                  />
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleRemove(jobId)}
                      style={{ color: 'var(--danger)', fontSize: '0.8rem' }}
                    >
                      Remove Bookmark
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No saved jobs in your shortlist"
            description="Browse verified entry-level roles and bookmark positions to track deadlines and review application requirements."
            action={
              <Link to="/jobs">
                <Button variant="navy" size="md">
                  Browse Verified Jobs
                </Button>
              </Link>
            }
          />
        )}

        {/* Application Modal */}
        <ApplicationModal
          isOpen={Boolean(applyingJob)}
          onClose={() => setApplyingJob(null)}
          job={applyingJob}
          onApplicationSuccess={() => fetchSavedJobs()}
        />
      </div>
    </DashboardLayout>
  );
};

export default SavedJobsPage;
