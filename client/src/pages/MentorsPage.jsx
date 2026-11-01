import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Briefcase,
  Award,
  Send,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import mentorService from '../services/mentorService';
import { useToast } from '../hooks/useToast';

const MentorsPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'all' | 'requests'
  const [loading, setLoading] = useState(true);

  // Recommendations state
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [targetRole, setTargetRole] = useState('Full Stack MERN Developer');

  // All mentors state
  const [allMentors, setAllMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  // Requests state
  const [myRequests, setMyRequests] = useState([]);

  // Request Modal state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const roles = [
    'Full Stack MERN Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Analyst',
    'Mobile App Developer'
  ];

  const industries = [
    'All',
    'Software & Internet Technologies',
    'Cloud Infrastructure & DevOps',
    'Artificial Intelligence',
    'Information Security & Cybersecurity',
    'Data Science & Analytics',
    'Robotics & Hardware Engineering'
  ];

  // Load recommended mentors
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await mentorService.getRecommendedMentors(targetRole);
      if (res?.data) {
        setRecommendedMentors(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load mentor recommendations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load all mentors
  const fetchAllMentors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedIndustry !== 'All') params.industry = selectedIndustry;
      if (selectedMode !== 'All') params.mode = selectedMode;

      const res = await mentorService.getAllMentors(params);
      if (res?.data) {
        setAllMentors(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load mentors directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load my mentorship requests
  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await mentorService.getMyRequests();
      if (res?.data) {
        setMyRequests(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load your mentorship requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recommended') {
      fetchRecommendations();
    } else if (activeTab === 'all') {
      fetchAllMentors();
    } else if (activeTab === 'requests') {
      fetchMyRequests();
    }
  }, [activeTab, targetRole]);

  // Handle Search in All Mentors
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAllMentors();
  };

  // Handle Submit Request
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;
    if (!requestMessage.trim()) {
      showToast('Please include a message describing your learning goals', 'warning');
      return;
    }

    try {
      setSubmittingRequest(true);
      const mentorId = selectedMentor.mentorId || selectedMentor._id;
      const res = await mentorService.sendMentorshipRequest(mentorId, requestMessage);
      showToast(res.message || 'Mentorship request sent successfully!', 'success');
      setSelectedMentor(null);
      setRequestMessage('');
      fetchMyRequests();
    } catch (error) {
      showToast(error.message || 'Failed to send mentorship request', 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Handle Cancel Request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this mentorship request?')) return;
    try {
      await mentorService.cancelRequest(requestId);
      showToast('Mentorship request cancelled.', 'info');
      fetchMyRequests();
    } catch (error) {
      showToast(error.message || 'Failed to cancel request', 'error');
    }
  };

  // Match badge styling
  const getMatchScoreStyle = (score) => {
    if (score >= 80) return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Exceptional Match' };
    if (score >= 60) return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe', label: 'Strong Match' };
    if (score >= 40) return { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Good Match' };
    return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: 'Relevant Match' };
  };

  // Status badge styling for requests
  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} /> };
      case 'Rejected':
        return { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={14} /> };
      case 'Cancelled':
        return { bg: '#f1f5f9', text: '#64748b', icon: <XCircle size={14} /> };
      default:
        return { bg: '#fef3c7', text: '#b45309', icon: <Clock size={14} /> };
    }
  };

  return (
    <DashboardLayout pageTitle="Intelligent Mentor Matching">
      <PageHeader
        title="Intelligent Mentor Matching System"
        description="Connect with industry leaders dynamically matched to your skills, missing competencies, career interests, and target roles."
        badge="AI Mentor Recommendation Engine"
      />

      {/* Main Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '2px solid var(--slate-200, #e2e8f0)',
          marginBottom: '1.75rem',
          paddingBottom: '0.5rem'
        }}
      >
        <button
          onClick={() => setActiveTab('recommended')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: activeTab === 'recommended' ? 'var(--navy-900, #0f172a)' : 'transparent',
            color: activeTab === 'recommended' ? '#fff' : 'var(--slate-600, #475569)',
            transition: 'all 0.2s ease'
          }}
        >
          <Sparkles size={16} /> Recommended For You
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: activeTab === 'all' ? 'var(--navy-900, #0f172a)' : 'transparent',
            color: activeTab === 'all' ? '#fff' : 'var(--slate-600, #475569)',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} /> Browse All Mentors
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: activeTab === 'requests' ? 'var(--navy-900, #0f172a)' : 'transparent',
            color: activeTab === 'requests' ? '#fff' : 'var(--slate-600, #475569)',
            transition: 'all 0.2s ease'
          }}
        >
          <Send size={16} /> My Mentorship Requests
          {myRequests.length > 0 && (
            <span
              style={{
                backgroundColor: activeTab === 'requests' ? '#38bdf8' : '#e2e8f0',
                color: activeTab === 'requests' ? '#0f172a' : '#475569',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              {myRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RECOMMENDED MENTORS */}
      {/* ======================================================== */}
      {activeTab === 'recommended' && (
        <div>
          {/* Target Track Filter Bar */}
          <div
            className="card"
            style={{
              marginBottom: '1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 1.25rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, letterSpacing: '0.05em' }}>
                Your Target Career Role
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
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

            <div style={{ fontSize: '0.825rem', color: 'var(--slate-500, #64748b)' }}>
              Matching Formula: <strong style={{ color: 'var(--navy-900, #0f172a)' }}>40% Skills</strong> •{' '}
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>25% Interests</strong> •{' '}
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>20% Skill Gap Guidance</strong> •{' '}
              <strong style={{ color: 'var(--navy-900, #0f172a)' }}>15% Role Relevance</strong>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500, #64748b)' }}>
              <Sparkles size={32} style={{ animation: 'spin 2s linear infinite', color: '#2563eb', marginBottom: '0.75rem' }} />
              <div>Calculating optimal mentor matches based on your skills and missing competencies...</div>
            </div>
          ) : recommendedMentors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Users size={40} style={{ color: 'var(--slate-400, #94a3b8)', marginBottom: '1rem' }} />
              <h3>No Mentor Matches Available</h3>
              <p style={{ color: 'var(--slate-500, #64748b)' }}>Check back soon as new industry mentors join the platform.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {recommendedMentors.map((item, idx) => {
                const m = item.mentor || item;
                const matchScore = item.matchScore || 0;
                const scoreStyle = getMatchScoreStyle(matchScore);

                return (
                  <div
                    key={m._id || idx}
                    className="card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      borderLeft: `5px solid ${scoreStyle.text}`
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            border: '2px solid #bfdbfe'
                          }}
                        >
                          {m.name ? m.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'M'}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900, #0f172a)' }}>
                              {m.name}
                            </h3>
                            <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                              <ShieldCheck size={14} /> Verified Industry Expert
                            </span>
                          </div>

                          <div style={{ fontSize: '0.9rem', color: 'var(--slate-600, #475569)', marginTop: '0.2rem' }}>
                            <strong>{m.title}</strong> at <span style={{ color: 'var(--navy-900, #0f172a)', fontWeight: 600 }}>{m.company}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--slate-500, #64748b)', marginTop: '0.3rem' }}>
                            <span>{m.industry}</span>
                            <span>•</span>
                            <span>{m.yearsOfExperience} Years Experience</span>
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize' }}>{m.preferredMode || 'online'} Mentoring</span>
                            <span>•</span>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{m.availability}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: scoreStyle.bg,
                            color: scoreStyle.text,
                            border: `1px solid ${scoreStyle.border}`,
                            padding: '0.35rem 0.85rem',
                            borderRadius: '20px',
                            fontWeight: 800,
                            fontSize: '1rem'
                          }}
                        >
                          <Sparkles size={16} /> {matchScore}% Match
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: scoreStyle.text, marginTop: '0.2rem' }}>
                          {scoreStyle.label}
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Explanation Banner */}
                    {item.recommendationReason && (
                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          fontSize: '0.85rem',
                          color: 'var(--slate-700, #334155)',
                          lineHeight: 1.5
                        }}
                      >
                        <strong style={{ color: 'var(--navy-900, #0f172a)' }}>Why Recommended: </strong>
                        {item.recommendationReason}
                      </div>
                    )}

                    {/* Score Breakdown Pills */}
                    {item.scoreBreakdown && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', color: 'var(--slate-600, #475569)' }}>
                          Skills Relevance: <strong>{item.scoreBreakdown.skillScore}%</strong> (40%)
                        </span>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', color: 'var(--slate-600, #475569)' }}>
                          Career Interests: <strong>{item.scoreBreakdown.interestScore}%</strong> (25%)
                        </span>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', color: 'var(--slate-600, #475569)' }}>
                          Skill Gap Guidance: <strong>{item.scoreBreakdown.guidanceScore}%</strong> (20%)
                        </span>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.55rem', borderRadius: '4px', color: 'var(--slate-600, #475569)' }}>
                          Role Alignment: <strong>{item.scoreBreakdown.roleScore}%</strong> (15%)
                        </span>
                      </div>
                    )}

                    {/* Skills Covered & Guidance Areas */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
                      {/* Shared Competencies */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Shared Skills ({item.matchingSkills?.length || 0}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {item.matchingSkills && item.matchingSkills.length > 0 ? (
                            item.matchingSkills.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: '#dcfce7',
                                  color: '#15803d',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}
                              >
                                ✓ {sk}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400, #94a3b8)' }}>No exact skill overlap</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills Mentor Can Guide */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Can Guide Your Skill Gaps ({item.guidanceSkills?.length || 0}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                          {item.guidanceSkills && item.guidanceSkills.length > 0 ? (
                            item.guidanceSkills.map((gSk, gIdx) => (
                              <span
                                key={gIdx}
                                style={{
                                  fontSize: '0.75rem',
                                  backgroundColor: '#dbeafe',
                                  color: '#1d4ed8',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: 600
                                }}
                              >
                                ✦ {gSk}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400, #94a3b8)' }}>Advanced engineering & architecture advice</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-600, #475569)', lineHeight: 1.5 }}>
                      {m.bio}
                    </p>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => setSelectedMentor(item)}
                        style={{
                          backgroundColor: 'var(--navy-900, #0f172a)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.55rem 1.25rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <Send size={15} /> Request Mentorship
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BROWSE ALL MENTORS */}
      {/* ======================================================== */}
      {activeTab === 'all' && (
        <div>
          {/* Search & Filter Controls */}
          <div
            className="card"
            style={{
              marginBottom: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1.25rem'
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search mentors by name, company, skill or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.5rem',
                    fontSize: '0.9rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--slate-300, #cbd5e1)'
                  }}
                />
              </div>

              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--slate-300, #cbd5e1)',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>

              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--slate-300, #cbd5e1)',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Modes</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="offline">Offline</option>
              </select>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--navy-900, #0f172a)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Filter Mentors
              </button>
            </form>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500, #64748b)' }}>
              Loading mentors directory...
            </div>
          ) : allMentors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Users size={40} style={{ color: 'var(--slate-400, #94a3b8)', marginBottom: '1rem' }} />
              <h3>No Mentors Found</h3>
              <p style={{ color: 'var(--slate-500, #64748b)' }}>Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {allMentors.map((m) => (
                <div
                  key={m._id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.1rem',
                          fontWeight: 700
                        }}
                      >
                        {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>

                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
                          {m.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-600, #475569)' }}>
                          {m.title} • <strong style={{ color: '#0f172a' }}>{m.company}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                        {m.industry}
                      </span>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                        {m.yearsOfExperience} yrs exp
                      </span>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'capitalize', color: '#475569' }}>
                        {m.preferredMode || 'online'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--slate-600, #475569)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                      {m.bio}
                    </p>

                    {/* Technical Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                      {Array.isArray(m.technicalSkills) &&
                        m.technicalSkills.slice(0, 5).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: '0.7rem',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontWeight: 500
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      {m.technicalSkills && m.technicalSkills.length > 5 && (
                        <span style={{ fontSize: '0.7rem', color: '#64748b', padding: '0.15rem' }}>
                          +{m.technicalSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      {m.availability}
                    </span>

                    <button
                      onClick={() => setSelectedMentor(m)}
                      style={{
                        backgroundColor: 'var(--navy-900, #0f172a)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Send size={13} /> Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MY MENTORSHIP REQUESTS */}
      {/* ======================================================== */}
      {activeTab === 'requests' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500, #64748b)' }}>
              Loading your mentorship requests...
            </div>
          ) : myRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Send size={40} style={{ color: 'var(--slate-400, #94a3b8)', marginBottom: '1rem' }} />
              <h3>No Requests Sent Yet</h3>
              <p style={{ color: 'var(--slate-500, #64748b)' }}>Explore our recommended mentors and send your first request.</p>
              <button
                onClick={() => setActiveTab('recommended')}
                style={{
                  marginTop: '1rem',
                  backgroundColor: 'var(--navy-900, #0f172a)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Browse Recommendations
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myRequests.map((req) => {
                const mentor = req.mentorId || {};
                const statusBadge = getRequestStatusBadge(req.status);

                return (
                  <div
                    key={req._id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900, #0f172a)' }}>
                          Mentorship Request to {mentor.name || 'Mentor'}
                        </h4>
                        <div style={{ fontSize: '0.825rem', color: 'var(--slate-600, #475569)', marginTop: '0.2rem' }}>
                          {mentor.title} at <strong>{mentor.company}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400, #94a3b8)', marginTop: '0.2rem' }}>
                          Submitted: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.text,
                          padding: '0.3rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        {statusBadge.icon} {req.status}
                      </div>
                    </div>

                    {/* Student Message */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'var(--slate-700, #334155)',
                        borderLeft: '3px solid #cbd5e1'
                      }}
                    >
                      <strong style={{ color: 'var(--navy-900, #0f172a)' }}>Your Goal / Message: </strong>
                      {req.message}
                    </div>

                    {/* Mentor Response if present */}
                    {req.mentorResponse && (
                      <div
                        style={{
                          backgroundColor: req.status === 'Accepted' ? '#f0fdf4' : '#fef2f2',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: req.status === 'Accepted' ? '#166534' : '#991b1b',
                          borderLeft: `3px solid ${req.status === 'Accepted' ? '#22c55e' : '#ef4444'}`
                        }}
                      >
                        <strong>Mentor Response: </strong> {req.mentorResponse}
                      </div>
                    )}

                    {/* Cancel Action if Pending */}
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                        <button
                          onClick={() => handleCancelRequest(req._id)}
                          style={{
                            backgroundColor: '#fff',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            padding: '0.35rem 0.85rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel Pending Request
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* REQUEST MENTORSHIP MODAL */}
      {/* ======================================================== */}
      {selectedMentor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
              maxWidth: '540px',
              width: '100%',
              padding: '1.75rem',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900, #0f172a)' }}>
                Request Mentorship
              </h3>
              <button
                onClick={() => setSelectedMentor(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900, #0f172a)' }}>
                {selectedMentor.mentorName || selectedMentor.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-600, #475569)' }}>
                {selectedMentor.title} • {selectedMentor.company}
              </div>
            </div>

            <form onSubmit={handleSendRequest}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  Describe your learning goals & areas you want guidance on:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g., Hi, I am currently preparing for full stack developer roles. I would appreciate your guidance on architecture design, state management in production, and code review feedback..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: '6px',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    lineHeight: 1.5,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Quick Goal Prompts */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Quick Prompts:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                  {[
                    'Guidance on overcoming skill gaps',
                    'Code & architecture review',
                    'Technical interview preparation',
                    'Industry portfolio feedback'
                  ].map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setRequestMessage((prev) => (prev ? `${prev} Also interested in ${prompt.toLowerCase()}.` : `I am looking for ${prompt.toLowerCase()} to accelerate my career.`))}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.725rem',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingRequest}
                  style={{
                    backgroundColor: 'var(--navy-900, #0f172a)',
                    border: 'none',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: submittingRequest ? 'not-allowed' : 'pointer',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: submittingRequest ? 0.7 : 1
                  }}
                >
                  <Send size={14} /> {submittingRequest ? 'Sending...' : 'Send Mentorship Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MentorsPage;
