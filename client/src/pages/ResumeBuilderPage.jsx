import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Save,
  Edit3,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import resumeService from '../services/resumeService';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const ResumeBuilderPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('ats');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // AI Assistant states
  const [aiGeneratingSummary, setAiGeneratingSummary] = useState(false);
  const [aiSummaryModalOpen, setAiSummaryModalOpen] = useState(false);
  const [aiSummaryOptions, setAiSummaryOptions] = useState([]);
  const [aiImprovingProjectIdx, setAiImprovingProjectIdx] = useState(null);

  // Section accordions
  const [openSections, setOpenSections] = useState({
    personal: true,
    summary: true,
    skills: true,
    projects: true,
    experience: false,
    education: true,
    certifications: false
  });

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const templates = [
    {
      id: 'classic',
      name: 'Classic Professional',
      tag: 'B&W Traditional',
      desc: 'Traditional serif typography, clean divider rules, and formal executive presentation.'
    },
    {
      id: 'modern',
      name: 'Modern Technical',
      tag: 'Developer Standard',
      desc: 'Subtle accent styling, structured technical competencies, and engineering project focus.'
    },
    {
      id: 'ats',
      name: 'ATS Friendly',
      tag: 'Maximum Parseability',
      desc: 'Strict single-column layout, standard headings, and zero formatting friction for screening algorithms.'
    },
    {
      id: 'creative',
      name: 'Creative Minimal',
      tag: 'Elegant & Clean',
      desc: 'Minimalist aesthetic with balanced spacing, refined typography, and strict ATS-safe structure.'
    }
  ];

  // Fetch student resumes and profile on mount
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [resumesRes, profileRes] = await Promise.all([
        resumeService.getMyResumes(),
        profileService.getProfile().catch(() => null)
      ]);

      const prof = profileRes?.data || null;
      const list = resumesRes?.data || [];
      setResumes(list);

      if (list.length > 0) {
        const active = list[0];
        setSelectedResumeId(active._id);
        setResumeData(active);
        setSelectedTemplate(active.template || 'ats');
      } else {
        // Create initial draft auto-populated from profile
        const newDraft = await resumeService.createResume({
          title: 'Full Stack Developer Resume',
          targetRole: prof?.desiredRole || 'Full Stack Developer',
          template: 'ats'
        });
        if (newDraft?.data) {
          setResumes([newDraft.data]);
          setSelectedResumeId(newDraft.data._id);
          setResumeData(newDraft.data);
          setSelectedTemplate(newDraft.data.template || 'ats');
        }
      }
    } catch (err) {
      showToast(err.message || 'Error initializing Resume Builder', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle switching active resume draft
  const handleSelectResume = (id) => {
    const found = resumes.find((r) => r._id === id);
    if (found) {
      setSelectedResumeId(id);
      setResumeData(found);
      setSelectedTemplate(found.template || 'ats');
    }
  };

  // Create new resume draft
  const handleCreateNewDraft = async () => {
    try {
      setSaving(true);
      const title = prompt('Enter a title for the new resume draft:', 'Software Engineer Resume');
      if (!title) {
        setSaving(false);
        return;
      }
      const created = await resumeService.createResume({
        title,
        targetRole: 'Software Engineer',
        template: selectedTemplate
      });
      if (created?.data) {
        setResumes([created.data, ...resumes]);
        setSelectedResumeId(created.data._id);
        setResumeData(created.data);
        showToast('Created new resume draft successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create new resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Duplicate current resume
  const handleDuplicateDraft = async () => {
    if (!selectedResumeId) return;
    try {
      setSaving(true);
      const dup = await resumeService.duplicateResume(selectedResumeId);
      if (dup?.data) {
        setResumes([dup.data, ...resumes]);
        setSelectedResumeId(dup.data._id);
        setResumeData(dup.data);
        showToast('Resume duplicated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to duplicate resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete current resume
  const handleDeleteDraft = async () => {
    if (!selectedResumeId) return;
    if (resumes.length <= 1) {
      showToast('You must maintain at least one resume draft.', 'warning');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${resumeData?.title}"?`)) return;

    try {
      setSaving(true);
      await resumeService.deleteResume(selectedResumeId);
      const remaining = resumes.filter((r) => r._id !== selectedResumeId);
      setResumes(remaining);
      setSelectedResumeId(remaining[0]._id);
      setResumeData(remaining[0]);
      showToast('Resume draft deleted successfully.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save/Update current resume draft
  const handleSaveDraft = async () => {
    if (!selectedResumeId || !resumeData) return;
    try {
      setSaving(true);
      const payload = {
        ...resumeData,
        template: selectedTemplate
      };
      const updated = await resumeService.updateResume(selectedResumeId, payload);
      if (updated?.data) {
        setResumeData(updated.data);
        setResumes(resumes.map((r) => (r._id === selectedResumeId ? updated.data : r)));
        showToast('Resume draft saved successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save resume draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    if (!selectedResumeId) return;
    try {
      setExporting(true);
      showToast(`Generating ${selectedTemplate.toUpperCase()} PDF...`, 'info');
      await resumeService.exportPdf(selectedResumeId, selectedTemplate);
      showToast('Resume PDF downloaded with selectable text!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to generate PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Form field mutators
  const updatePersonalInfo = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...(prev?.personalInfo || {}),
        [field]: value
      }
    }));
  };

  // Skills handlers
  const handleAddSkill = () => {
    const name = prompt('Enter technical or soft skill name:');
    if (!name || !name.trim()) return;
    const current = resumeData?.skills || [];
    setResumeData((prev) => ({
      ...prev,
      skills: [...current, { name: name.trim(), category: 'Technical Skills', proficiency: 'Intermediate' }]
    }));
  };

  const handleRemoveSkill = (idx) => {
    const current = [...(resumeData?.skills || [])];
    current.splice(idx, 1);
    setResumeData((prev) => ({ ...prev, skills: current }));
  };

  // Project handlers
  const handleAddProject = () => {
    const newProj = {
      title: 'New Engineering Project',
      description: 'Built full-stack application with modern frameworks and responsive UI.',
      technologies: ['React', 'Node.js'],
      bulletPoints: ['Engineered responsive web client and RESTful microservices.']
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...(prev?.projects || []), newProj]
    }));
  };

  const handleUpdateProject = (index, field, value) => {
    const list = [...(resumeData?.projects || [])];
    list[index] = { ...list[index], [field]: value };
    setResumeData((prev) => ({ ...prev, projects: list }));
  };

  const handleRemoveProject = (index) => {
    const list = [...(resumeData?.projects || [])];
    list.splice(index, 1);
    setResumeData((prev) => ({ ...prev, projects: list }));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu = {
      institution: 'University / Institute of Technology',
      degree: 'B.Tech in Computer Science',
      fieldOfStudy: 'Engineering',
      startYear: 2022,
      endYear: 2026,
      grade: '8.5 CGPA'
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...(prev?.education || []), newEdu]
    }));
  };

  const handleUpdateEducation = (index, field, value) => {
    const list = [...(resumeData?.education || [])];
    list[index] = { ...list[index], [field]: value };
    setResumeData((prev) => ({ ...prev, education: list }));
  };

  const handleRemoveEducation = (index) => {
    const list = [...(resumeData?.education || [])];
    list.splice(index, 1);
    setResumeData((prev) => ({ ...prev, education: list }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp = {
      company: 'Tech Solutions Inc.',
      role: 'Software Developer Intern',
      startDate: 'Jun 2025',
      endDate: 'Aug 2025',
      current: false,
      description: 'Collaborated on frontend features and automated API testing.'
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...(prev?.experience || []), newExp]
    }));
  };

  const handleUpdateExperience = (index, field, value) => {
    const list = [...(resumeData?.experience || [])];
    list[index] = { ...list[index], [field]: value };
    setResumeData((prev) => ({ ...prev, experience: list }));
  };

  const handleRemoveExperience = (index) => {
    const list = [...(resumeData?.experience || [])];
    list.splice(index, 1);
    setResumeData((prev) => ({ ...prev, experience: list }));
  };

  // AI Summary Assistant
  const handleTriggerAiSummary = async () => {
    try {
      setAiGeneratingSummary(true);
      showToast('Consulting Google Gemini to craft ATS summaries...', 'info');

      const res = await resumeService.generateSummary({
        fullName: resumeData?.personalInfo?.fullName || user?.name,
        targetRole: resumeData?.targetRole || 'Full Stack Developer',
        skills: resumeData?.skills || [],
        education: resumeData?.education || [],
        experience: resumeData?.experience || [],
        projects: resumeData?.projects || []
      });

      if (res?.data?.options) {
        setAiSummaryOptions(res.data.options);
        setAiSummaryModalOpen(true);
      } else {
        showToast('No summaries returned by AI engine', 'warning');
      }
    } catch (err) {
      showToast(err.message || 'AI summary generation unavailable', 'error');
    } finally {
      setAiGeneratingSummary(false);
    }
  };

  // AI Project Bullet Point Improver
  const handleTriggerAiProject = async (projIdx) => {
    const proj = resumeData?.projects?.[projIdx];
    if (!proj) return;

    try {
      setAiImprovingProjectIdx(projIdx);
      showToast(`AI generating STAR bullet points for "${proj.title}"...`, 'info');

      const res = await resumeService.improveProject({
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies || [],
        existingPoints: proj.bulletPoints || []
      });

      if (res?.data?.bulletPoints) {
        handleUpdateProject(projIdx, 'bulletPoints', res.data.bulletPoints);
        if (res.data.improvedDescription) {
          handleUpdateProject(projIdx, 'description', res.data.improvedDescription);
        }
        showToast('Action-verb bullet points applied! You can edit them below.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to improve project points', 'error');
    } finally {
      setAiImprovingProjectIdx(null);
    }
  };

  // Extract preview data
  const p = resumeData?.personalInfo || {};
  const studentName = p.fullName || user?.name || 'Alex Johnson';
  const studentRole = resumeData?.targetRole || 'Full Stack MERN Developer';
  const studentEmail = p.email || user?.email || 'alex.johnson@college.edu';
  const studentPhone = p.phone || '+91 98765 43210';
  const studentLocation = p.location || 'Bangalore, India';
  const studentSummary = p.summary || 'Proactive computer science undergraduate with strong foundations in JavaScript, React, and Node.js. Experienced in designing scalable web services and responsive interfaces.';
  const studentSkills = resumeData?.skills || [];
  const studentProjects = resumeData?.projects || [];
  const studentEducation = resumeData?.education || [];
  const studentExperience = resumeData?.experience || [];

  return (
    <DashboardLayout pageTitle="AI Resume Builder">
      <PageHeader
        title="AI-Powered ATS Resume Builder"
        description="Craft, enhance, and download verified ATS-compliant technical resumes using genuine profile achievements and real-time AI assistance."
        badge={`${selectedTemplate.toUpperCase()} Template Active`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleCreateNewDraft}
              disabled={loading || saving}
            >
              New Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={handleDuplicateDraft}
              disabled={loading || saving}
            >
              Duplicate
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSaveDraft}
              disabled={loading || saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              variant="navy"
              size="sm"
              icon={Download}
              onClick={handleExportPdf}
              disabled={exporting || loading}
            >
              {exporting ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
        }
      />

      {/* Draft Switcher & Template Selector Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Active Draft Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>Active Draft:</label>
            <select
              value={selectedResumeId}
              onChange={(e) => handleSelectResume(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                minWidth: '220px'
              }}
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} ({r.targetRole || 'Resume'})
                </option>
              ))}
            </select>
            {resumes.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteDraft}
                title="Delete this draft"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Exactly 4 Templates Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>ATS Template:</span>
            {templates.map((tpl) => {
              const active = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: active ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: active ? '#eff6ff' : 'var(--bg-surface)',
                    color: active ? 'var(--primary)' : 'var(--text-muted)'
                  }}
                  title={tpl.desc}
                >
                  {tpl.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Editor (Forms & AI), Right Live Preview Sheet */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Form Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. Personal & Contact Details */}
          <div className="card">
            <div
              onClick={() => toggleSection('personal')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>1. Personal & Contact Info</h3>
              </div>
              {openSections.personal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {openSections.personal && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={p.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Job Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={resumeData?.targetRole || ''}
                      onChange={(e) => setResumeData((prev) => ({ ...prev, targetRole: e.target.value }))}
                      placeholder="e.g. Full Stack Developer"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={p.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="student@college.edu"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={p.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Location (City, Country)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={p.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="Bangalore, India"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>LinkedIn / GitHub URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={p.linkedinUrl || p.githubUrl || ''}
                      onChange={(e) => updatePersonalInfo('linkedinUrl', e.target.value)}
                      placeholder="linkedin.com/in/alex-dev"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Professional Summary with AI Generator */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                onClick={() => toggleSection('summary')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
              >
                <Sparkles size={18} color="var(--purple)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>2. Professional Summary</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Sparkles}
                  onClick={handleTriggerAiSummary}
                  disabled={aiGeneratingSummary}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  {aiGeneratingSummary ? 'AI Generating...' : 'AI Summary Assistant'}
                </Button>
                {openSections.summary ? <ChevronUp size={18} onClick={() => toggleSection('summary')} style={{ cursor: 'pointer' }} /> : <ChevronDown size={18} onClick={() => toggleSection('summary')} style={{ cursor: 'pointer' }} />}
              </div>
            </div>

            {openSections.summary && (
              <div style={{ marginTop: '0.75rem' }}>
                <textarea
                  rows={4}
                  value={p.summary || ''}
                  onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                  placeholder="Enter a concise 3-4 sentence professional summary highlighting your core tech stack, engineering passion, and career aspirations..."
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    lineHeight: '1.4'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tip: Use the AI Summary Assistant to generate tailored options without fabricating facts.
                </span>
              </div>
            )}
          </div>

          {/* 3. Technical Skills Matrix */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                onClick={() => toggleSection('skills')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
              >
                <Code size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>3. Technical Skills ({studentSkills.length})</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddSkill} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Add Skill
                </Button>
                {openSections.skills ? <ChevronUp size={18} onClick={() => toggleSection('skills')} style={{ cursor: 'pointer' }} /> : <ChevronDown size={18} onClick={() => toggleSection('skills')} style={{ cursor: 'pointer' }} />}
              </div>
            </div>

            {openSections.skills && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {studentSkills.map((sk, idx) => {
                    const name = typeof sk === 'string' ? sk : sk.name;
                    return (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.55rem',
                          backgroundColor: '#f1f5f9',
                          color: 'var(--navy-900)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontSize: '11px' }}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Engineering Projects */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                onClick={() => toggleSection('projects')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
              >
                <Layers size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>4. Projects ({studentProjects.length})</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddProject} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Add Project
                </Button>
                {openSections.projects ? <ChevronUp size={18} onClick={() => toggleSection('projects')} style={{ cursor: 'pointer' }} /> : <ChevronDown size={18} onClick={() => toggleSection('projects')} style={{ cursor: 'pointer' }} />}
              </div>
            </div>

            {openSections.projects && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {studentProjects.map((proj, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        value={proj.title || ''}
                        onChange={(e) => handleUpdateProject(pIdx, 'title', e.target.value)}
                        placeholder="Project Title"
                        style={{ fontWeight: 600, fontSize: '0.9rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', width: '65%' }}
                      />
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Sparkles}
                          onClick={() => handleTriggerAiProject(pIdx)}
                          disabled={aiImprovingProjectIdx === pIdx}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
                        >
                          {aiImprovingProjectIdx === pIdx ? 'Enhancing...' : 'AI Enhance Points'}
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(pIdx)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) => handleUpdateProject(pIdx, 'description', e.target.value)}
                      placeholder="Core project description..."
                      style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', marginBottom: '0.4rem' }}
                    />

                    {Array.isArray(proj.bulletPoints) && proj.bulletPoints.length > 0 && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>STAR Bullet Points:</label>
                        {proj.bulletPoints.map((bp, bpIdx) => (
                          <div key={bpIdx} style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.8rem' }}>•</span>
                            <input
                              type="text"
                              value={bp}
                              onChange={(e) => {
                                const newBps = [...proj.bulletPoints];
                                newBps[bpIdx] = e.target.value;
                                handleUpdateProject(pIdx, 'bulletPoints', newBps);
                              }}
                              style={{ width: '100%', fontSize: '0.78rem', border: '1px solid #e2e8f0', borderRadius: '3px', padding: '0.2rem 0.4rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Experience & Internships */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                onClick={() => toggleSection('experience')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
              >
                <Briefcase size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>5. Experience & Internships ({studentExperience.length})</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddExperience} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Add Experience
                </Button>
                {openSections.experience ? <ChevronUp size={18} onClick={() => toggleSection('experience')} style={{ cursor: 'pointer' }} /> : <ChevronDown size={18} onClick={() => toggleSection('experience')} style={{ cursor: 'pointer' }} />}
              </div>
            </div>

            {openSections.experience && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studentExperience.map((exp, eIdx) => (
                  <div key={eIdx} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => handleUpdateExperience(eIdx, 'role', e.target.value)}
                        placeholder="Job / Role Title"
                        style={{ fontWeight: 600, fontSize: '0.85rem', width: '50%', padding: '0.25rem' }}
                      />
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => handleUpdateExperience(eIdx, 'company', e.target.value)}
                        placeholder="Company Name"
                        style={{ fontSize: '0.85rem', width: '40%', padding: '0.25rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(eIdx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => handleUpdateExperience(eIdx, 'description', e.target.value)}
                      placeholder="Responsibilities and contributions..."
                      style={{ width: '100%', fontSize: '0.8rem', padding: '0.35rem' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Education */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                onClick={() => toggleSection('education')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
              >
                <GraduationCap size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>6. Education & Academics ({studentEducation.length})</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddEducation} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Add Education
                </Button>
                {openSections.education ? <ChevronUp size={18} onClick={() => toggleSection('education')} style={{ cursor: 'pointer' }} /> : <ChevronDown size={18} onClick={() => toggleSection('education')} style={{ cursor: 'pointer' }} />}
              </div>
            </div>

            {openSections.education && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studentEducation.map((edu, edIdx) => (
                  <div key={edIdx} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => handleUpdateEducation(edIdx, 'institution', e.target.value)}
                        placeholder="Institution / College"
                        style={{ fontWeight: 600, fontSize: '0.85rem', width: '60%', padding: '0.25rem' }}
                      />
                      <input
                        type="text"
                        value={edu.endYear || ''}
                        onChange={(e) => handleUpdateEducation(edIdx, 'endYear', e.target.value)}
                        placeholder="Grad Year"
                        style={{ fontSize: '0.85rem', width: '30%', padding: '0.25rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edIdx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => handleUpdateEducation(edIdx, 'degree', e.target.value)}
                        placeholder="Degree / Qualification"
                        style={{ fontSize: '0.8rem', width: '60%', padding: '0.25rem' }}
                      />
                      <input
                        type="text"
                        value={edu.grade || ''}
                        onChange={(e) => handleUpdateEducation(edIdx, 'grade', e.target.value)}
                        placeholder="CGPA / Grade"
                        style={{ fontSize: '0.8rem', width: '40%', padding: '0.25rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Live Resume Sheet Preview (Dynamically styled by selectedTemplate) */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              padding: '0.25rem 0.5rem'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              LIVE RESUME SHEET PREVIEW ({templates.find((t) => t.id === selectedTemplate)?.name})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>● ATS Synchronized</span>
          </div>

          <div
            className="resume-preview-sheet"
            style={{
              background: '#ffffff',
              padding: '2.5rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              minHeight: '680px',
              color: selectedTemplate === 'creative' ? '#18181b' : '#111827',
              fontFamily: selectedTemplate === 'classic' ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Top Accent Bar if Modern Technical */}
            {selectedTemplate === 'modern' && (
              <div style={{ height: '4px', backgroundColor: '#1e3a8a', marginBottom: '1.25rem', borderRadius: '2px' }} />
            )}

            {/* Header: Name and Contact */}
            <div
              style={{
                textAlign: selectedTemplate === 'classic' || selectedTemplate === 'ats' ? 'center' : 'left',
                borderBottom: selectedTemplate === 'classic' ? '1px solid #111827' : (selectedTemplate === 'creative' ? '1px solid #e4e4e7' : '2px solid #0f172a'),
                paddingBottom: '0.85rem',
                marginBottom: '1.25rem'
              }}
            >
              <h2
                style={{
                  fontSize: selectedTemplate === 'modern' ? '1.65rem' : '1.45rem',
                  fontWeight: 800,
                  color: selectedTemplate === 'modern' ? '#1e3a8a' : (selectedTemplate === 'creative' ? '#18181b' : '#0a192f'),
                  letterSpacing: selectedTemplate === 'creative' ? '0.04em' : '0.02em',
                  textTransform: 'uppercase',
                  margin: 0
                }}
              >
                {studentName}
              </h2>

              <p style={{ fontSize: '0.875rem', color: selectedTemplate === 'modern' ? '#2563eb' : '#475569', fontWeight: 600, marginTop: '0.2rem', marginBottom: '0.35rem' }}>
                {studentRole}
              </p>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {[studentEmail, studentPhone, studentLocation, p.linkedinUrl || 'LinkedIn', p.githubUrl || 'GitHub'].filter(Boolean).join('  |  ')}
              </p>
            </div>

            {/* Profile / Summary */}
            {studentSummary && (
              <div style={{ marginBottom: '1rem' }}>
                <h4
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: selectedTemplate === 'modern' ? '#1e3a8a' : '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.2rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  {selectedTemplate === 'creative' ? 'Profile Summary' : 'Professional Summary'}
                </h4>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.45', color: '#334155', margin: 0 }}>
                  {studentSummary}
                </p>
              </div>
            )}

            {/* Technical Skills */}
            {studentSkills.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: selectedTemplate === 'modern' ? '#1e3a8a' : '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.2rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Technical Competencies
                </h4>
                <p style={{ fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
                  <strong>Core Skills: </strong>
                  {studentSkills.map((s) => (typeof s === 'string' ? s : s.name)).join(' • ')}
                </p>
              </div>
            )}

            {/* Key Projects */}
            {studentProjects.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: selectedTemplate === 'modern' ? '#1e3a8a' : '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.2rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Technical & Engineering Projects
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {studentProjects.map((proj, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                        <strong>{proj.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {proj.technologies?.join(', ') || 'Full Stack'}
                        </span>
                      </div>
                      {proj.description && (
                        <p style={{ fontSize: '0.78rem', color: '#334155', margin: '0.15rem 0' }}>
                          {proj.description}
                        </p>
                      )}
                      {Array.isArray(proj.bulletPoints) && proj.bulletPoints.map((bp, bidx) => (
                        <p key={bidx} style={{ fontSize: '0.78rem', color: '#334155', margin: '0.1rem 0 0.1rem 0.6rem' }}>
                          • {bp}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {studentEducation.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: selectedTemplate === 'modern' ? '#1e3a8a' : '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.2rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Education & Qualifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {studentEducation.map((edu, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                        <strong>{edu.institution}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                          {edu.startYear ? `${edu.startYear} - ` : ''}{edu.endYear}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.1rem 0' }}>
                        {edu.degree} {edu.grade ? `(${edu.grade})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience if present */}
            {studentExperience.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: selectedTemplate === 'modern' ? '#1e3a8a' : '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.2rem',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Experience & Internships
                </h4>
                {studentExperience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <strong>{exp.role} — {exp.company}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    {exp.description && <p style={{ fontSize: '0.78rem', color: '#334155', margin: '0.1rem 0' }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Assistant Modal */}
      {aiSummaryModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 25, 47, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '650px',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-xl)',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--purple)" />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: 0 }}>
                  AI-Generated ATS Professional Summaries
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAiSummaryModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
              Select a tailored summary option crafted by Google Gemini based on your genuine skills and projects:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {aiSummaryOptions.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '1rem',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {opt.type}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        updatePersonalInfo('summary', opt.text);
                        setAiSummaryModalOpen(false);
                        showToast('Applied AI summary to resume draft!', 'success');
                      }}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Use This Summary
                    </Button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--navy-900)', lineHeight: '1.45', margin: 0 }}>
                    "{opt.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResumeBuilderPage;
