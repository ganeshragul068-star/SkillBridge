import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  CheckCircle2,
  Calendar,
  ArrowRight
} from 'lucide-react';
import Button from './Button';
import './JobCard.css';

const JobCard = ({
  job,
  onApply,
  onToggleSave,
  isSaved = false,
  hasApplied = false
}) => {
  const id = job._id || job.id;
  const title = job.title;
  const company = job.company;
  const location = job.location || 'Remote';
  const jobType = job.jobType || job.type || 'Internship';
  const workMode = job.workMode || job.workplace || 'Remote';
  const salary = job.salary || job.stipend || 'Disclosed upon interview';
  const description = job.description || '';
  const skills = job.requiredSkills || job.tags || [];
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString()
    : null;
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString()
    : (job.postedDate || 'Recent');

  const savedStatus = isSaved || job.isSaved;
  const appliedStatus = hasApplied || job.hasApplied;

  return (
    <div className={`job-card ${job.featured ? 'job-card-featured' : ''}`}>
      <div className="job-card-top">
        <div className="job-company-avatar">
          {company.charAt(0).toUpperCase()}
        </div>

        <div className="job-header-info">
          <div className="job-title-row">
            <Link to={`/jobs/${id}`} className="job-title-link">
              <h3 className="job-title">{title}</h3>
            </Link>
            {appliedStatus && (
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                <CheckCircle2 size={12} /> Applied
              </span>
            )}
          </div>
          <span className="job-company-name">{company}</span>
        </div>

        {onToggleSave && (
          <button
            onClick={() => onToggleSave(id)}
            className={`job-save-btn ${savedStatus ? 'is-saved' : ''}`}
            title={savedStatus ? 'Remove from Saved' : 'Save Opportunity'}
            aria-label="Save Job"
          >
            <Bookmark size={17} fill={savedStatus ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="job-meta-grid">
        <div className="job-meta-item">
          <MapPin size={14} />
          <span>{location}</span>
        </div>
        <div className="job-meta-item">
          <Briefcase size={14} />
          <span>{jobType} • {workMode}</span>
        </div>
        <div className="job-meta-item stipend-item">
          <DollarSign size={14} />
          <span>{salary}</span>
        </div>
        {deadline && (
          <div className="job-meta-item">
            <Calendar size={14} />
            <span>Deadline: {deadline}</span>
          </div>
        )}
      </div>

      <p className="job-description">
        {description.length > 140 ? `${description.slice(0, 140)}...` : description}
      </p>

      {skills.length > 0 && (
        <div className="job-tags-list">
          {skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="job-skill-tag">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="job-skill-tag" style={{ background: 'transparent', border: 'none' }}>
              +{skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="job-card-footer">
        <span className="job-posted-time">Posted {postedDate}</span>
        <div className="job-actions">
          <Link to={`/jobs/${id}`}>
            <Button variant="secondary" size="sm">
              Details
            </Button>
          </Link>

          {appliedStatus ? (
            <Link to="/applications">
              <Button variant="outline" size="sm">
                View Status
              </Button>
            </Link>
          ) : (
            <Button
              variant="navy"
              size="sm"
              onClick={() => onApply && onApply(job)}
            >
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
