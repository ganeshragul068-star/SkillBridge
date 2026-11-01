import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Filter, ExternalLink, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import RecommendedCourseCard from '../components/matching/RecommendedCourseCard';
import matchingService from '../services/matchingService';
import { useToast } from '../hooks/useToast';

const CoursesPage = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [targetRole, setTargetRole] = useState('Full Stack MERN Developer');
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const roles = [
    'Full Stack MERN Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Analyst',
    'Mobile App Developer'
  ];

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await matchingService.getCourseRecommendations(targetRole);
      if (res?.data) {
        setCourses(res.data);
        setMissingSkills(res.missingSkills || []);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load course recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [targetRole]);

  return (
    <DashboardLayout pageTitle="Personalized Course Recommendations">
      <PageHeader
        title="Curated Course Recommendations"
        description="High-yield courses dynamically matched to address your specific skill gaps from the active MongoDB catalog."
        badge="Phase 6 Recommendation Engine"
      />

      {/* Role Filter & Status Bar */}
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
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, letterSpacing: '0.05em' }}>
            Target Career Track
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--slate-300, #cbd5e1)',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {missingSkills.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>
              Identified Gaps ({missingSkills.length}):
            </span>
            {missingSkills.slice(0, 4).map((s, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.725rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                {s}
              </span>
            ))}
            {missingSkills.length > 4 && (
              <span style={{ fontSize: '0.725rem', color: 'var(--slate-500, #64748b)' }}>
                +{missingSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Analyzing missing skills and ranking courses by relevance...</p>
        </div>
      ) : courses.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            color: 'var(--slate-600, #475569)'
          }}
        >
          <BookOpen size={36} color="var(--slate-400, #94a3b8)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--navy-900, #0f172a)' }}>
            No Matching Courses Available
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem', color: 'var(--slate-500, #64748b)' }}>
            No active courses currently match your missing skills for {targetRole}, or you have already satisfied the requirements.
          </p>
          <Link
            to="/roadmap"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <Compass size={15} /> View Learning Roadmap
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map((course) => (
            <RecommendedCourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CoursesPage;
