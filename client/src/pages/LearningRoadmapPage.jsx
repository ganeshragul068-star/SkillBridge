import React, { useState, useEffect } from 'react';
import { Compass, Plus, Sparkles, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import ProgressTracker from '../components/matching/ProgressTracker';
import LearningRoadmap from '../components/matching/LearningRoadmap';
import matchingService from '../services/matchingService';
import { useToast } from '../hooks/useToast';

const LearningRoadmapPage = () => {
  const { showToast } = useToast();
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await matchingService.getRoadmap();
      if (res?.data) {
        setRoadmapData(res.data);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load learning roadmap', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleUpdateStatus = async (stepId, status) => {
    try {
      const res = await matchingService.updateRoadmapStep(stepId, { status });
      if (res?.data) {
        showToast(`Milestone marked as ${status.replace('-', ' ')}`, 'success');
        // Update local state smoothly
        setRoadmapData((prev) => {
          if (!prev) return prev;
          const updatedSteps = prev.steps.map((s) => (s._id === stepId ? res.data.step : s));
          return {
            ...prev,
            steps: updatedSteps,
            completionPercentage: res.data.completionPercentage,
            completedCount: res.data.completedCount
          };
        });
      }
    } catch (error) {
      showToast(error.message || 'Failed to update step status', 'error');
    }
  };

  const handleDeleteStep = async (stepId) => {
    try {
      await matchingService.deleteRoadmapStep(stepId);
      showToast('Milestone removed from roadmap', 'info');
      fetchRoadmap();
    } catch (error) {
      showToast(error.message || 'Failed to remove milestone', 'error');
    }
  };

  const handleAddCustomStep = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      showToast('Please enter a skill or topic name', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await matchingService.createRoadmap({
        customSkill: newSkill.trim(),
        priority: newPriority,
        targetRole: roadmapData?.targetRole || 'Personalized Roadmap'
      });
      showToast(`Added '${newSkill.trim()}' to learning roadmap!`, 'success');
      setNewSkill('');
      setShowAddModal(false);
      fetchRoadmap();
    } catch (error) {
      showToast(error.message || 'Failed to add custom step', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Learning Roadmap">
      <PageHeader
        title="Personalized Learning Roadmap"
        description="Structured, foundational milestones to close your competency gaps for your target career role."
        badge={roadmapData ? `Target: ${roadmapData.targetRole}` : 'Personalized Curriculum'}
      />

      {/* Top Progress Tracker */}
      {roadmapData && (
        <div style={{ marginBottom: '2rem' }}>
          <ProgressTracker
            completed={roadmapData.completedCount || 0}
            total={roadmapData.totalSteps || 0}
            percentage={roadmapData.completionPercentage || 0}
            title={`${roadmapData.targetRole} Readiness Milestone Tracker`}
            subtitle="Real-time progress persisted in MongoDB"
          />
        </div>
      )}

      {/* Action Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Compass size={22} color="#2563eb" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--navy-900, #0f172a)' }}>
              Step-by-Step Curriculum
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500, #64748b)' }}>
              Foundational skills are ordered before dependent technologies
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={fetchRoadmap}
            title="Refresh"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--slate-100, #f1f5f9)',
              border: '1px solid var(--slate-300, #cbd5e1)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--navy-900, #0f172a)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.825rem',
              fontWeight: 600
            }}
          >
            <Plus size={15} /> Add Custom Skill Step
          </button>
        </div>
      </div>

      {/* Roadmap List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--slate-500, #64748b)' }}>
          <Sparkles size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <p>Loading personalized learning curriculum...</p>
        </div>
      ) : (
        <LearningRoadmap
          steps={roadmapData?.steps || []}
          onUpdateStatus={handleUpdateStatus}
          onDeleteStep={handleDeleteStep}
        />
      )}

      {/* Add Custom Skill Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--navy-900, #0f172a)' }}>
              Add Learning Step
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--slate-600, #475569)' }}>
              Add a specialized technology or learning goal to your roadmap.
            </p>

            <form onSubmit={handleAddCustomStep}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Skill or Technology Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, GraphQL, Redis"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.9rem'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Learning Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.9rem',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="High">🔴 High Priority (Immediate)</option>
                  <option value="Medium">🟡 Medium Priority (Core)</option>
                  <option value="Low">⚪ Low Priority (Supplementary)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--slate-100, #f1f5f9)',
                    border: '1px solid var(--slate-300, #cbd5e1)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--navy-900, #0f172a)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Adding...' : 'Add Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LearningRoadmapPage;
