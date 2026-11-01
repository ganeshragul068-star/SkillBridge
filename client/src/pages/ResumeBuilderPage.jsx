import React, { useState, useEffect } from 'react';
import { FileText, Download, Sparkles, Plus, Eye, Check, RefreshCw } from 'lucide-react';
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

  const [resume, setResume] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('ats');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const templates = [
    { id: 'ats', name: 'ATS Standard' },
    { id: 'modern', name: 'Modern Technical' },
    { id: 'classic', name: 'Classic Professional' }
  ];

  // Load existing resume or auto-populate from profile
  const loadResumeData = async () => {
    try {
      setLoading(true);
      const [resumesRes, profileRes] = await Promise.all([
        resumeService.getMyResumes(),
        profileService.getProfile().catch(() => null)
      ]);

      if (profileRes?.data) {
        setProfile(profileRes.data);
      }

      if (resumesRes?.data && resumesRes.data.length > 0) {
        setResume(resumesRes.data[0]);
        if (resumesRes.data[0].template) {
          setSelectedTemplate(resumesRes.data[0].template);
        }
      } else {
        // Auto-create from student profile
        const created = await resumeService.createResume({
          title: 'Full Stack Developer Resume',
          targetRole: 'Full Stack Developer',
          template: 'ats'
        });
        if (created?.data) {
          setResume(created.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'Error loading resume data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, []);

  // Handle Export PDF
  const handleExportPdf = async () => {
    if (!resume?._id) {
      showToast('No active resume found to export', 'error');
      return;
    }

    try {
      setExporting(true);
      showToast(`Generating ${selectedTemplate.toUpperCase()} PDF...`, 'info');
      await resumeService.exportPdf(resume._id, selectedTemplate);
      showToast('Resume PDF downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to export resume PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Helper values for preview
  const studentName = resume?.personalInfo?.fullName || user?.name || 'Alex Johnson';
  const studentEmail = resume?.personalInfo?.email || user?.email || 'alex.johnson@college.edu';
  const studentPhone = resume?.personalInfo?.phone || profile?.phone || '+91 98765 43210';
  const studentCollege = resume?.education?.[0]?.institution || profile?.college || 'National Institute of Technology';
  const studentDegree = resume?.education?.[0]?.degree || profile?.degree || 'B.Tech in Computer Science';
  const studentGradYear = resume?.education?.[0]?.endYear || profile?.graduationYear || 2026;
  const studentProjects = resume?.projects?.length > 0 ? resume.projects : (profile?.projects || []);
  const studentSkills = resume?.skills?.length > 0 ? resume.skills : (profile?.skills || []);

  return (
    <DashboardLayout pageTitle="Resume Builder">
      <PageHeader
        title="ATS-Friendly College Resume Builder"
        description="Format your academic achievements, engineering projects, and technical skills into a recruiter-ready single-page PDF."
        badge={`${selectedTemplate.toUpperCase()} Template Active`}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--slate-300, #cbd5e1)',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <Button
              variant="navy"
              size="sm"
              icon={Download}
              onClick={handleExportPdf}
              disabled={exporting || loading}
            >
              {exporting ? 'Generating PDF...' : 'Export ATS PDF'}
            </Button>
          </div>
        }
      />

      <div className="grid-2">
        {/* Editor Sections Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>1. Contact & Academic Header</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Auto-populated from your profile: {studentName} • {studentCollege} ({studentGradYear})
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>2. Technical Skills Matrix</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Grouped by Languages, Frameworks, Developer Tools, and Databases.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
              {studentSkills.slice(0, 8).map((sk, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  {typeof sk === 'string' ? sk : (sk.name || sk.skillName)}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>3. Projects & Practical Work</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              Structured with STAR methodology (Situation, Task, Action, Result).
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--slate-600)' }}>
              {studentProjects.length > 0 ? (
                <div>• {studentProjects[0].title || studentProjects[0].name} ({studentProjects[0].techStack?.join(', ') || 'React, Node.js'})</div>
              ) : (
                <div>• CampHub — Event Management Platform (React, Node.js)</div>
              )}
            </div>
          </div>
        </div>

        {/* Live Resume Sheet Preview */}
        <div className="card" style={{ background: 'var(--white)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--navy-900)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', letterSpacing: '0.05em' }}>{studentName.toUpperCase()}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
              {studentEmail} | {studentPhone} | GitHub | LinkedIn
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Education</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <strong>{studentCollege}</strong>
              <span>{studentGradYear}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{studentDegree}</p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Featured Projects</h4>
            <div style={{ fontSize: '0.85rem' }}>
              {studentProjects.length > 0 ? (
                <div>
                  <strong>{studentProjects[0].title || studentProjects[0].name}</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {studentProjects[0].description || 'Built scalable full-stack web application with responsive UI, secure authentication, and database caching.'}
                  </p>
                </div>
              ) : (
                <div>
                  <strong>CampHub - College Event Management</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Built full-stack React and Express platform handling 500+ ticket bookings with JWT authentication and QR verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeBuilderPage;
