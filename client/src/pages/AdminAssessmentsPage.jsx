import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
  Percent,
  RefreshCw,
  Search
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import assessmentService from '../services/assessmentService';
import { useToast } from '../hooks/useToast';

const AdminAssessmentsPage = () => {
  const { showToast } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('');
  const [category, setCategory] = useState('Programming Languages');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(20);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      marks: 1
    }
  ]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [assRes, statsRes] = await Promise.all([
        assessmentService.getAssessments(),
        assessmentService.getAssessmentStats()
      ]);
      if (assRes?.data) setAssessments(assRes.data);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (error) {
      showToast(error.message || 'Failed to load admin assessments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openCreateModal = () => {
    setEditingAssessment(null);
    setTitle('');
    setSkill('');
    setCategory('Programming Languages');
    setDifficulty('Intermediate');
    setDescription('');
    setDuration(20);
    setPassingScore(70);
    setQuestions([
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        marks: 1
      }
    ]);
    setShowModal(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        marks: 1
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      showToast('Assessment must contain at least 1 question', 'error');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIdx].options[optIdx] = val;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !skill.trim() || !description.trim()) {
      showToast('Please fill in title, skill, and description', 'error');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        showToast(`Question #${i + 1} text is required`, 'error');
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        showToast(`All 4 options for Question #${i + 1} must be filled`, 'error');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        skill: skill.trim(),
        category,
        difficulty,
        description: description.trim(),
        duration: Number(duration),
        passingScore: Number(passingScore),
        questions
      };

      if (editingAssessment) {
        await assessmentService.updateAssessment(editingAssessment._id, payload);
        showToast('Assessment updated successfully!', 'success');
      } else {
        await assessmentService.createAssessment(payload);
        showToast('Assessment created successfully!', 'success');
      }

      setShowModal(false);
      fetchAdminData();
    } catch (error) {
      showToast(error.message || 'Failed to save assessment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await assessmentService.deleteAssessment(id);
      showToast('Assessment deleted', 'info');
      fetchAdminData();
    } catch (error) {
      showToast(error.message || 'Failed to delete assessment', 'error');
    }
  };

  return (
    <DashboardLayout pageTitle="Admin Assessment Management">
      <PageHeader
        title="Admin Assessment Management Console"
        description="Create, edit, and curate competency assessments, multiple-choice questions, answer keys, and passing thresholds."
        badge="Administrator Privilege"
      />

      {/* Admin Summary Metrics */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Assessments"
          value={(stats?.totalAssessments || assessments.length).toString()}
          subtitle="Curated question banks"
          icon={Award}
          variant="blue"
        />
        <StatCard
          title="Total Attempts Taken"
          value={(stats?.totalAttempts || 0).toString()}
          subtitle="Student submissions scored"
          icon={Users}
          variant="navy"
        />
        <StatCard
          title="Overall Pass Rate"
          value={`${stats?.overallPassRate || 0}%`}
          subtitle="Meets >=70% threshold"
          icon={Percent}
          variant="emerald"
        />
      </div>

      {/* Controls Bar */}
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
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900, #0f172a)' }}>
          All Active Assessments ({assessments.length})
        </h3>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={fetchAdminData}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              border: '1px solid var(--slate-300, #cbd5e1)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Plus size={15} /> Create Assessment
          </button>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--slate-50, #f8fafc)', borderBottom: '1px solid var(--slate-200, #e2e8f0)', textAlign: 'left', color: 'var(--slate-600, #475569)' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Title</th>
              <th style={{ padding: '0.85rem 1rem' }}>Skill</th>
              <th style={{ padding: '0.85rem 1rem' }}>Difficulty</th>
              <th style={{ padding: '0.85rem 1rem' }}>Questions</th>
              <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
              <th style={{ padding: '0.85rem 1rem' }}>Passing Mark</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a._id} style={{ borderBottom: '1px solid var(--slate-100, #f1f5f9)' }}>
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--navy-900, #0f172a)' }}>
                  {a.title}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                    {a.skill}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>{a.difficulty}</td>
                <td style={{ padding: '0.85rem 1rem' }}>{a.totalQuestions} Qs</td>
                <td style={{ padding: '0.85rem 1rem' }}>{a.duration} Mins</td>
                <td style={{ padding: '0.85rem 1rem' }}><strong>{a.passingScore}%</strong></td>
                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleDelete(a._id)}
                    style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.35rem' }}
                    title="Delete assessment"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Assessment Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '780px',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--navy-900, #0f172a)' }}>
              Create Standardized Skill Assessment
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>Assessment Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. React.js Hooks & Optimization"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>Tested Skill *</label>
                  <input
                    type="text"
                    placeholder="e.g. React.js"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                  >
                    <option value="Programming Languages">Programming Languages</option>
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Database">Database</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Passing Mark (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>Description *</label>
                <textarea
                  rows="2"
                  placeholder="Short description of skills tested..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  required
                />
              </div>

              {/* Questions Section */}
              <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--navy-900, #0f172a)' }}>
                    Questions ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    style={{
                      fontSize: '0.775rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Question #{qIdx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Remove Question
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Enter question text..."
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.75rem' }}
                    />

                    {/* 4 Options */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{String.fromCharCode(65 + optIdx)}:</span>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, marginBottom: '0.2rem' }}>Correct Answer</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', Number(e.target.value))}
                          style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#fff' }}
                        >
                          <option value={0}>Option A</option>
                          <option value={1}>Option B</option>
                          <option value={2}>Option C</option>
                          <option value={3}>Option D</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, marginBottom: '0.2rem' }}>Explanation</label>
                        <input
                          type="text"
                          placeholder="Why this answer is correct..."
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAssessmentsPage;
