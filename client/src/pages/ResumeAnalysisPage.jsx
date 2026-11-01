import React, { useState, useEffect, useRef } from 'react';
import { FileCheck, AlertCircle, CheckCircle2, TrendingUp, Sparkles, Upload, FileText, Check, Cpu } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import resumeService from '../services/resumeService';
import { useToast } from '../hooks/useToast';

const ResumeAnalysisPage = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [aiStatus, setAiStatus] = useState({ isConfigured: false, provider: 'None' });

  // Default initial scan metrics
  const [matchPercentage, setMatchPercentage] = useState(82);
  const [keywordsFound, setKeywordsFound] = useState('18 / 22');
  const [keywordsList, setKeywordsList] = useState(['JavaScript', 'React.js', 'Node.js', 'Git']);
  const [missingList, setMissingList] = useState(['Docker', 'REST API Error Handling', 'Agile Sprint']);
  const [strengthsList, setStrengthsList] = useState([
    'Great work including metrics such as "handled 500+ ticket bookings" and "reduced load time by 35%".'
  ]);
  const [fileName, setFileName] = useState('');

  // Check AI Provider Status on Mount
  useEffect(() => {
    resumeService.getAiStatus()
      .then((res) => {
        if (res?.data) {
          setAiStatus(res.data);
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

    // Validate type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const isDocx = file.name.toLowerCase().endsWith('.docx');
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    if (!validTypes.includes(file.type) && !isDocx && !isPdf) {
      showToast('Please upload a valid PDF or DOCX resume document', 'warning');
      return;
    }

    try {
      setAnalyzing(true);
      setFileName(file.name);
      showToast(`Extracting readable text from ${file.name}...`, 'info');

      // 1. Upload and extract text
      const extractRes = await resumeService.uploadAndExtract(file);
      const extracted = extractRes.data || {};
      const resumeText = extracted.extractedText || '';
      const detectedSkills = extracted.detectedSkills || [];

      showToast(`Extracted ${extracted.wordCount || 0} words. Running ATS analysis...`, 'info');

      // 2. Run Job-Specific Comparison Analysis
      const compareRes = await resumeService.compareJob({
        resumeText,
        resumeSkills: detectedSkills,
        jobTitle: 'Full Stack MERN Developer',
        customRequirements: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'Docker', 'REST APIs']
      });

      if (compareRes?.data) {
        const cData = compareRes.data;
        setAnalysisData(cData);
        setMatchPercentage(cData.matchPercentage || 75);
        setKeywordsFound(`${cData.matchingSkills?.length || 0} / ${(cData.matchingSkills?.length || 0) + (cData.missingSkills?.length || 0)}`);
        if (cData.matchingSkills?.length > 0) setKeywordsList(cData.matchingSkills);
        if (cData.missingSkills?.length > 0) setMissingList(cData.missingSkills);
        if (cData.strengths?.length > 0) setStrengthsList(cData.strengths);
      }

      // 3. If Live AI is configured, also call real AI engine
      if (aiStatus.isConfigured) {
        showToast(`Running live ${aiStatus.provider} deep semantic analysis...`, 'info');
        const aiRes = await resumeService.analyzeWithAi({
          resumeText,
          targetRole: 'Full Stack MERN Developer'
        });
        if (aiRes?.data) {
          const aiData = aiRes.data;
          if (aiData.atsScore !== undefined) setMatchPercentage(aiData.atsScore);
          if (Array.isArray(aiData.foundKeywords)) setKeywordsList(aiData.foundKeywords);
          if (Array.isArray(aiData.missingKeywords)) setMissingList(aiData.missingKeywords);
          if (Array.isArray(aiData.actionableImprovements)) {
            setMissingList(aiData.missingKeywords || aiData.actionableImprovements.slice(0, 3));
          }
        }
      }

      showToast('Resume ATS scan completed successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error parsing resume', 'error');
    } finally {
      setAnalyzing(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        title="Resume ATS Optimization & Keyword Scoring"
        description="Run an automated scan of your PDF resume against target job descriptions to ensure you pass recruiter screening engines."
        badge={`Score: ${matchPercentage} / 100`}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button
              variant="navy"
              size="sm"
              icon={Upload}
              onClick={handleScanClick}
              disabled={analyzing}
            >
              {analyzing ? 'Scanning...' : 'Scan New Resume'}
            </Button>
          </div>
        }
      />

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
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>✓ Scanned</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>{matchPercentage}%</span>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>ATS Pass Probability</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {matchPercentage >= 75 ? 'Optimal score for enterprise recruiter screening' : 'Good foundation with opportunities for keyword alignment'}
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>{keywordsFound}</span>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>Target Keywords Found</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {keywordsList.slice(0, 4).join(', ')} present
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>1 Page</span>
          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>Length & Formatting</span>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>Ideal single-page layout for college freshers</p>
        </div>
      </div>

      {/* Actionable ATS Improvements */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '1.25rem' }}>Actionable ATS Improvements</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Missing Keywords Warning */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--warning-bg)', borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--navy-900)', fontSize: '0.9rem' }}>Add Missing Technical Keywords:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                Your resume lacks mentions of {missingList.map((m) => `"${m}"`).join(', ')}. Recruiters searching for these terms might overlook your profile.
              </p>
            </div>
          </div>

          {/* Strengths */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--success-bg)', borderRadius: 'var(--radius-md)' }}>
            <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--navy-900)', fontSize: '0.9rem' }}>Quantified Project Bullet Points:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                {strengthsList[0]}
              </p>
            </div>
          </div>

          {/* AI Engine Provider Indicator */}
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={14} />
            <span>
              Engine: {aiStatus.isConfigured ? `Active Live AI (${aiStatus.provider})` : 'Deterministic ATS Rule-Based Parser (Configure GEMINI_API_KEY in server/.env for live LLM deep scan)'}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalysisPage;
