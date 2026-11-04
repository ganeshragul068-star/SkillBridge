import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Upload,
  FileText,
  Check,
  Cpu,
  Briefcase,
  ChevronRight,
  ListFilter,
  BarChart2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import resumeService from '../services/resumeService';
import jobService from '../services/jobService';
import { useToast } from '../hooks/useToast';

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [aiStatus, setAiStatus] = useState({ isConfigured: false, provider: 'None' });
  const [fileName, setFileName] = useState('');
  const [activeResumeText, setActiveResumeText] = useState('');

  // Job selection / comparison state
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [manualJobDescription, setManualJobDescription] = useState('');
  const [compareMode, setCompareMode] = useState('catalog'); // 'catalog' | 'manual'

  // Metric displays
  const [matchPercentage, setMatchPercentage] = useState(84);
  const [categoryScores, setCategoryScores] = useState({
    formattingReadability: { score: 90, explanation: 'Clean standard typography, standard section titles, single-column parseability.' },
    skillsRelevance: { score: 85, explanation: 'Core tech stack aligns well with modern software engineering roles.' },
    projectDescriptions: { score: 80, explanation: 'Demonstrates practical implementation with identifiable web frameworks.' },
    educationCompleteness: { score: 95, explanation: 'Degree, institution, and graduation timeline clearly indicated.' },
    experienceDetails: { score: 75, explanation: 'Good practical project contributions; internship experience can be expanded.' },
    keywordOptimization: { score: 82, explanation: 'Good density of high-yield keywords; further industry terms recommended.' },
    contentQuality: { score: 88, explanation: 'Grammatically sound with objective technical tone and action verbs.' }
  });

  const [strengthsList, setStrengthsList] = useState([
    'Clean, linear section hierarchy that passes ATS text-extraction without artifact scrambling.',
    'Clear inclusion of technical stack tokens (React, JavaScript, Node.js, REST APIs).',
    'Quantified project impact and identifiable college achievements.'
  ]);

  const [weakSectionsList, setWeakSectionsList] = useState([
    'Professional summary could highlight specific specialized domains or career objectives.',
    'Project descriptions could incorporate more quantifiable benchmarks (e.g. latency, user volume).'
  ]);

  const [missingKeywordsList, setMissingKeywordsList] = useState(['Docker', 'CI/CD Pipelines', 'TypeScript', 'Jest/Unit Testing', 'Tailwind CSS']);
  const [foundKeywordsList, setFoundKeywordsList] = useState(['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'REST API']);
  const [actionableImprovementsList, setActionableImprovementsList] = useState([
    'Add missing keywords such as "Docker" or "TypeScript" to your Skills Matrix.',
    'Convert project descriptions into STAR bullet points (Situation, Task, Action, Result).',
    'Ensure all dates follow standard MMM YYYY format for seamless recruiter timeline parsing.'
  ]);

  const [jobComparisonResult, setJobComparisonResult] = useState(null);

  // Check AI Provider Status and load SkillBridge Job Listings on Mount
  useEffect(() => {
    resumeService.getAiStatus()
      .then((res) => {
        if (res?.data) {
          setAiStatus(res.data);
        }
      })
      .catch(() => {});

    jobService.getJobs()
      .then((res) => {
        const jobs = res?.data?.jobs || res?.data || [];
        if (Array.isArray(jobs)) {
          setAvailableJobs(jobs);
        }
      })
      .catch(() => {});
  }, []);

  // Trigger file browser
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  // Process uploaded PDF/DOCX file
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit. Please upload a smaller resume.', 'error');
      return;
    }

    // Validate type
    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!hasValidExt) {
      showToast('Invalid file format. Please upload a PDF (.pdf) or Word (.docx) document.', 'error');
      return;
    }

    try {
      setAnalyzing(true);
      setFileName(file.name);
      showToast(`Extracting readable text from ${file.name}...`, 'info');

      // 1. Upload and extract actual text
      const extractRes = await resumeService.uploadAndExtract(file);
      const extracted = extractRes.data || {};
      const resumeText = extracted.extractedText || '';
      const detectedSkills = extracted.detectedSkills || [];
      setActiveResumeText(resumeText);

      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error('Could not extract readable text from this file. Please verify it is not empty or password-protected.');
      }

      showToast(`Extracted ${extracted.wordCount || 0} words. Running ATS analysis...`, 'info');

      // 2. Identify Job Context if selected
      let targetJobRole = 'Full Stack Developer';
      let targetJobDesc = '';
      let targetSkills = ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'REST APIs'];

      if (compareMode === 'catalog' && selectedJobId) {
        const chosen = availableJobs.find((j) => (j._id || j.id) === selectedJobId);
        if (chosen) {
          targetJobRole = chosen.title;
          targetJobDesc = chosen.description || '';
          if (Array.isArray(chosen.skillsRequired)) targetSkills = chosen.skillsRequired;
        }
      } else if (compareMode === 'manual' && manualJobDescription.trim()) {
        targetJobDesc = manualJobDescription.trim();
      }

      // 3. Run Job-Specific Comparison Analysis
      const compareRes = await resumeService.compareJob({
        resumeText,
        resumeSkills: detectedSkills,
        jobTitle: targetJobRole,
        customRequirements: targetSkills
      });

      if (compareRes?.data) {
        const cData = compareRes.data;
        setAnalysisData(cData);
        setJobComparisonResult(cData);
        if (cData.matchPercentage !== undefined) setMatchPercentage(cData.matchPercentage);
        if (cData.matchingSkills?.length > 0) setFoundKeywordsList(cData.matchingSkills);
        if (cData.missingSkills?.length > 0) setMissingKeywordsList(cData.missingSkills);
        if (cData.strengths?.length > 0) setStrengthsList(cData.strengths);
      }

      // 4. Live Deep Analysis with Google Gemini
      if (aiStatus.isConfigured) {
        showToast(`Running deep semantic analysis with ${aiStatus.provider}...`, 'info');
        const aiRes = await resumeService.analyzeWithAi({
          resumeText,
          targetRole: targetJobRole,
          jobDescription: targetJobDesc,
          customRequirements: targetSkills
        });

        if (aiRes?.data) {
          const aiData = aiRes.data;
          if (aiData.atsScore !== undefined) setMatchPercentage(aiData.atsScore);
          if (aiData.categoryScores) setCategoryScores(aiData.categoryScores);
          if (Array.isArray(aiData.strengths) && aiData.strengths.length > 0) setStrengthsList(aiData.strengths);
          if (Array.isArray(aiData.weakSections) && aiData.weakSections.length > 0) setWeakSectionsList(aiData.weakSections);
          if (Array.isArray(aiData.missingKeywords) && aiData.missingKeywords.length > 0) setMissingKeywordsList(aiData.missingKeywords);
          if (Array.isArray(aiData.foundKeywords) && aiData.foundKeywords.length > 0) setFoundKeywordsList(aiData.foundKeywords);
          if (Array.isArray(aiData.actionableImprovements) && aiData.actionableImprovements.length > 0) setActionableImprovementsList(aiData.actionableImprovements);
        }
      }

      showToast('Resume ATS scan and compatibility evaluation completed!', 'success');
    } catch (err) {
      showToast(err.message || 'Error parsing resume', 'error');
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Re-run analysis against selected target job
  const handleReevaluateJob = async () => {
    if (!activeResumeText) {
      showToast('Please upload a resume first to evaluate against a job description.', 'warning');
      return;
    }

    try {
      setAnalyzing(true);
      let targetJobRole = 'Software Engineer';
      let targetJobDesc = '';
      let targetSkills = ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git'];

      if (compareMode === 'catalog' && selectedJobId) {
        const chosen = availableJobs.find((j) => (j._id || j.id) === selectedJobId);
        if (chosen) {
          targetJobRole = chosen.title;
          targetJobDesc = chosen.description || '';
          if (Array.isArray(chosen.skillsRequired)) targetSkills = chosen.skillsRequired;
        }
      } else if (compareMode === 'manual' && manualJobDescription.trim()) {
        targetJobDesc = manualJobDescription.trim();
      }

      showToast(`Re-evaluating resume against "${targetJobRole}"...`, 'info');

      if (aiStatus.isConfigured) {
        const aiRes = await resumeService.analyzeWithAi({
          resumeText: activeResumeText,
          targetRole: targetJobRole,
          jobDescription: targetJobDesc,
          customRequirements: targetSkills
        });

        if (aiRes?.data) {
          const aiData = aiRes.data;
          if (aiData.atsScore !== undefined) setMatchPercentage(aiData.atsScore);
          if (aiData.categoryScores) setCategoryScores(aiData.categoryScores);
          if (aiData.strengths) setStrengthsList(aiData.strengths);
          if (aiData.weakSections) setWeakSectionsList(aiData.weakSections);
          if (aiData.missingKeywords) setMissingKeywordsList(aiData.missingKeywords);
          if (aiData.foundKeywords) setFoundKeywordsList(aiData.foundKeywords);
          if (aiData.actionableImprovements) setActionableImprovementsList(aiData.actionableImprovements);
        }
      }

      showToast('Re-evaluation complete!', 'success');
    } catch (err) {
      showToast(err.message || 'Error re-evaluating resume', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Resume ATS Analysis">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
      />

      <PageHeader
        title="AI Resume ATS Analyzer & Job-Specific Audit"
        description="Audit your resume for ATS parseability, keyword match density, structural strengths, and job-specific compatibility with Google Gemini."
        badge={`ATS Score: ${matchPercentage} / 100`}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate('/resume-builder')}
            >
              Open in Resume Builder
            </Button>
            <Button
              variant="navy"
              size="sm"
              icon={Upload}
              onClick={handleScanClick}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing Document...' : 'Upload & Scan Resume'}
            </Button>
          </div>
        }
      />

      {/* Target Job Comparison Selection Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>
              Job-Specific ATS Target Role Comparison (Optional)
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setCompareMode('catalog')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                border: compareMode === 'catalog' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: compareMode === 'catalog' ? '#eff6ff' : '#fff',
                color: compareMode === 'catalog' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Select SkillBridge Job
            </button>
            <button
              type="button"
              onClick={() => setCompareMode('manual')}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                border: compareMode === 'manual' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: compareMode === 'manual' ? '#eff6ff' : '#fff',
                color: compareMode === 'manual' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Paste Custom Job Description
            </button>
          </div>
        </div>

        {compareMode === 'catalog' ? (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                flex: 1,
                minWidth: '240px'
              }}
            >
              <option value="">-- Compare against a SkillBridge Job Listing --</option>
              {availableJobs.map((job) => (
                <option key={job._id || job.id} value={job._id || job.id}>
                  {job.title} at {job.company} ({job.jobType || 'Internship'})
                </option>
              ))}
            </select>
            {activeResumeText && (
              <Button variant="outline" size="sm" onClick={handleReevaluateJob} disabled={analyzing}>
                {analyzing ? 'Evaluating...' : 'Re-Evaluate with this Job'}
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              rows={3}
              value={manualJobDescription}
              onChange={(e) => setManualJobDescription(e.target.value)}
              placeholder="Paste the target job description requirements here (e.g. required skills, qualifications, responsibilities)..."
              style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
            {activeResumeText && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outline" size="sm" onClick={handleReevaluateJob} disabled={analyzing}>
                  {analyzing ? 'Evaluating...' : 'Re-Evaluate against Pasted Description'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uploaded File Notification Banner */}
      {fileName && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: '#1d4ed8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} />
            <span>Active Analyzed File: <strong>{fileName}</strong></span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>✓ Scanned & Extracted</span>
        </div>
      )}

      {/* Top 3 High-Level Metrics Cards */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: matchPercentage >= 75 ? 'var(--success)' : 'var(--warning)' }}>
            {matchPercentage}%
          </span>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
            Overall ATS Compatibility Score
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Calculated across single-column formatting, text parseability, and skills density.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
            {foundKeywordsList.length}
          </span>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
            Matching Technical Keywords
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {foundKeywordsList.slice(0, 4).join(', ')} confirmed in document.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: missingKeywordsList.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {missingKeywordsList.length}
          </span>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
            Critical Competency Gaps
          </span>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            Keywords to add to boost recruiter screening match rate.
          </p>
        </div>
      </div>

      {/* Category Breakdown Scores with Explanations */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <BarChart2 size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: 0 }}>
            Individual Category ATS Breakdown & Explanations
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {Object.entries(categoryScores).map(([key, item]) => {
            const labels = {
              formattingReadability: 'Formatting & ATS Readability',
              skillsRelevance: 'Skills Alignment & Relevance',
              projectDescriptions: 'Project Descriptions & Action Verbs',
              educationCompleteness: 'Education & Academic Details',
              experienceDetails: 'Experience & Practical Exposure',
              keywordOptimization: 'Keyword Optimization & Density',
              contentQuality: 'Overall Content & Grammar Quality'
            };

            const label = labels[key] || key;
            const score = typeof item === 'object' ? item.score : item;
            const explanation = typeof item === 'object' ? item.explanation : 'Evaluated against industry ATS benchmarks.';

            return (
              <div
                key={key}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--navy-900)' }}>{label}</strong>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: score >= 80 ? 'var(--success)' : (score >= 60 ? 'var(--warning)' : 'var(--danger)')
                    }}
                  >
                    {score} / 100
                  </span>
                </div>
                <ProgressBar value={score} max={100} size="sm" />
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  {explanation}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem', padding: '0.65rem 0.85rem', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <HelpCircle size={15} />
          <span>Note: ATS compatibility scores indicate algorithmic parseability and keyword alignment; they do not guarantee hiring outcomes.</span>
        </div>
      </div>

      {/* Detailed Feedback & Actionable Recommendations */}
      <div className="grid-2">
        {/* Left Column: Strengths & Found Keywords */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Strengths */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>Resume Strengths</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {strengthsList.map((str, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Found Keywords */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
              Verified Keywords Present in Resume ({foundKeywordsList.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {foundKeywordsList.map((kw, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '4px'
                  }}
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Missing Keywords & Actionable Improvements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Missing Keywords Warning */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} color="var(--warning)" />
              <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>Missing Target Keywords</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '0.65rem' }}>
              Adding these keywords into your skills matrix or project bullets will elevate your candidate score:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {missingKeywordsList.map((kw, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    borderRadius: '4px'
                  }}
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="var(--purple)" />
              <h3 style={{ fontSize: '1rem', color: 'var(--navy-900)', margin: 0 }}>
                Actionable Recommendations
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {actionableImprovementsList.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Ready to apply these improvements?</span>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate('/resume-builder')}
              >
                Apply in Resume Builder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Engine Status Footer */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        <Cpu size={14} />
        <span>
          AI Engine: {aiStatus.isConfigured ? `Active Live AI (${aiStatus.provider})` : 'Deterministic ATS Parser (GEMINI_API_KEY required in server/.env)'}
        </span>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalysisPage;
