import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import FormInput from '../components/common/FormInput';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import SkillCard from '../components/profile/SkillCard';
import AddEditSkillModal, { SKILL_CATEGORIES } from '../components/profile/AddEditSkillModal';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import skillService from '../services/skillService';

const SkillsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    skillId: null,
    skillName: ''
  });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await skillService.getSkills(selectedCategory, searchQuery);
      if (res && res.data) {
        setSkills(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch skills inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [selectedCategory, searchQuery]);

  const handleSaveSkill = async (skillData) => {
    if (editingSkill) {
      await skillService.updateSkill(editingSkill._id, skillData);
      showToast(`Skill '${skillData.name}' updated successfully!`, 'success');
    } else {
      await skillService.addSkill(skillData);
      showToast(`Skill '${skillData.name}' added to your profile!`, 'success');
    }
    setEditingSkill(null);
    fetchSkills();
  };

  const handleDeleteSkill = (skillId, skillName) => {
    setDeleteDialog({
      isOpen: true,
      skillId,
      skillName
    });
  };

  const confirmDelete = async () => {
    try {
      await skillService.deleteSkill(deleteDialog.skillId);
      showToast(`Skill '${deleteDialog.skillName}' removed from profile.`, 'info');
      setDeleteDialog({ isOpen: false, skillId: null, skillName: '' });
      fetchSkills();
    } catch (err) {
      showToast(err.message || 'Failed to delete skill.', 'error');
    }
  };

  const allCategories = ['All', ...SKILL_CATEGORIES];

  return (
    <DashboardLayout pageTitle="Technical Skills Inventory">
      <div style={{ paddingBottom: '3rem' }}>
        <PageHeader
          title="Technical Skills Inventory"
          description="Manage your technical and soft skill proficiencies, categorize your expertise, and prepare your profile for campus placement algorithms."
          badge={`${skills.length} Skills Listed`}
          isPhase1Preview={false}
          actions={
            <Button
              variant="navy"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingSkill(null);
                setIsModalOpen(true);
              }}
            >
              Add New Skill
            </Button>
          }
        />

        {/* Search & Category Filter Toolbar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <FormInput
                  placeholder="Search skills (e.g. React, Docker, Python)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
              </div>
              <Button
                variant="navy"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingSkill(null);
                  setIsModalOpen(true);
                }}
              >
                Add Skill
              </Button>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--navy-900)' : 'var(--border-color)',
                    backgroundColor: selectedCategory === cat ? 'var(--navy-900)' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--slate-700)',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <LoadingState text="Loading your verified skills catalog..." />
        ) : skills.length > 0 ? (
          <div className="skills-catalog-grid">
            {skills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                onEdit={(s) => {
                  setEditingSkill(s);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDeleteSkill(skill._id, skill.name)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title={selectedCategory !== 'All' ? `No ${selectedCategory} skills found` : 'No skills in your profile yet'}
            description="Add programming languages, frameworks, developer tools, and soft skills to showcase your career readiness."
            action={
              <Button
                variant="navy"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingSkill(null);
                  setIsModalOpen(true);
                }}
              >
                Add Your First Skill
              </Button>
            }
          />
        )}

        {/* Add / Edit Skill Modal */}
        <AddEditSkillModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSkill(null);
          }}
          initialData={editingSkill}
          onSave={handleSaveSkill}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          title="Remove Skill"
          message={`Are you sure you want to remove "${deleteDialog.skillName}" from your profile?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, skillId: null, skillName: '' })}
          variant="danger"
          confirmText="Yes, Remove"
        />
      </div>
    </DashboardLayout>
  );
};

export default SkillsPage;
