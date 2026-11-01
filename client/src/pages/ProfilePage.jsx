import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FolderGit2,
  Award,
  Plus,
  Sparkles,
  Target,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ConfirmationDialog from '../components/common/ConfirmationDialog';

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileCompletionCard from '../components/profile/ProfileCompletionCard';
import PersonalInfoModal from '../components/profile/PersonalInfoModal';
import EducationCard from '../components/profile/EducationCard';
import EducationModal from '../components/profile/EducationModal';
import ProjectCard from '../components/profile/ProjectCard';
import ProjectModal from '../components/profile/ProjectModal';
import CertificationCard from '../components/profile/CertificationCard';
import CertificationModal from '../components/profile/CertificationModal';
import SkillBadge from '../components/common/SkillBadge';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import profileService from '../services/profileService';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(null);

  // Modals state
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  // Delete confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Fetch full profile from backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfileMe();
      if (res && res.data) {
        setProfile(res.data);
        setCompletion(res.data.completion);
      }
    } catch (err) {
      showToast(err.message || 'Could not load profile data from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -------------------------------------------------------------
  // Personal Info Handlers
  // -------------------------------------------------------------
  const handleSavePersonalInfo = async (data) => {
    const res = await profileService.updateProfileMe(data);
    if (res && res.data) {
      setProfile(res.data);
      setCompletion(res.data.completion);
      showToast('Personal information updated successfully!', 'success');
    }
  };

  // -------------------------------------------------------------
  // Education Handlers
  // -------------------------------------------------------------
  const handleSaveEducation = async (data) => {
    if (editingEdu) {
      const res = await profileService.updateEducation(editingEdu._id, data);
      showToast('Education record updated.', 'success');
    } else {
      const res = await profileService.addEducation(data);
      showToast('Education record added.', 'success');
    }
    setEditingEdu(null);
    fetchProfile();
  };

  const handleDeleteEducation = (eduId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Education Record',
      message: 'Are you sure you want to remove this academic credential from your profile?',
      onConfirm: async () => {
        try {
          await profileService.deleteEducation(eduId);
          showToast('Education record removed.', 'info');
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchProfile();
        } catch (err) {
          showToast(err.message || 'Failed to delete education record.', 'error');
        }
      }
    });
  };

  // -------------------------------------------------------------
  // Project Handlers
  // -------------------------------------------------------------
  const handleSaveProject = async (data) => {
    if (editingProj) {
      await profileService.updateProject(editingProj._id, data);
      showToast('Project updated successfully.', 'success');
    } else {
      await profileService.addProject(data);
      showToast('Project added to portfolio.', 'success');
    }
    setEditingProj(null);
    fetchProfile();
  };

  const handleDeleteProject = (projId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Portfolio Project',
      message: 'Are you sure you want to delete this project? This will remove it from your recruiter view.',
      onConfirm: async () => {
        try {
          await profileService.deleteProject(projId);
          showToast('Project removed.', 'info');
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchProfile();
        } catch (err) {
          showToast(err.message || 'Failed to delete project.', 'error');
        }
      }
    });
  };

  // -------------------------------------------------------------
  // Certification Handlers
  // -------------------------------------------------------------
  const handleSaveCertification = async (data) => {
    if (editingCert) {
      await profileService.updateCertification(editingCert._id, data);
      showToast('Certification updated successfully.', 'success');
    } else {
      await profileService.addCertification(data);
      showToast('Certification added to profile.', 'success');
    }
    setEditingCert(null);
    fetchProfile();
  };

  const handleDeleteCertification = (certId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Certification',
      message: 'Are you sure you want to remove this credential record?',
      onConfirm: async () => {
        try {
          await profileService.deleteCertification(certId);
          showToast('Certification removed.', 'info');
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          fetchProfile();
        } catch (err) {
          showToast(err.message || 'Failed to delete certification.', 'error');
        }
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Student Profile">
        <LoadingState text="Loading your verified profile records..." />
      </DashboardLayout>
    );
  }

  const educationList = profile?.education || [];
  const projectsList = profile?.projects || [];
  const certsList = profile?.certifications || [];
  const skillsList = profile?.skills || [];

  return (
    <DashboardLayout pageTitle="Student Profile">
      <div className="profile-page-content" style={{ paddingBottom: '3rem' }}>
        <PageHeader
          title="Student Profile & Employability Portfolio"
          description="Manage your verified academic history, portfolio projects, certifications, and technical skills for campus recruiters."
          badge={user?.role === 'student' ? 'Verified Student Account' : 'Campus User'}
          isPhase1Preview={false}
        />

        {/* Dynamic Profile Header */}
        <ProfileHeader
          profile={profile}
          user={user}
          onEdit={() => setEditPersonalOpen(true)}
        />

        {/* Dynamic Profile Completion Widget */}
        <ProfileCompletionCard completion={completion} />

        {/* Main Sections Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Technical Skills Quick Summary Strip */}
          <div className="profile-section-block">
            <div className="section-head-row">
              <h3 className="section-head-title">
                <Target size={20} color="var(--blue-600)" />
                Technical Skills ({skillsList.length})
              </h3>
              <Link to="/skills">
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  Manage All Skills
                </Button>
              </Link>
            </div>

            {skillsList.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {skillsList.map((skill, index) => (
                  <SkillBadge
                    key={skill._id || index}
                    name={skill.name}
                    level={skill.proficiency || 'Intermediate'}
                    status="acquired"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="No technical skills added yet"
                description="Add your programming languages, frameworks, and database proficiencies to increase your recruiter match rate."
                action={
                  <Link to="/skills">
                    <Button variant="navy" size="sm" icon={Plus}>
                      Add First Skill
                    </Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* 2. Portfolio Projects Section */}
          <div className="profile-section-block">
            <div className="section-head-row">
              <h3 className="section-head-title">
                <FolderGit2 size={20} color="var(--blue-600)" />
                Portfolio Projects ({projectsList.length})
              </h3>
              <Button
                variant="navy"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingProj(null);
                  setProjModalOpen(true);
                }}
              >
                Add Project
              </Button>
            </div>

            {projectsList.length > 0 ? (
              projectsList.map((proj) => (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  onEdit={(p) => {
                    setEditingProj(p);
                    setProjModalOpen(true);
                  }}
                  onDelete={handleDeleteProject}
                />
              ))
            ) : (
              <EmptyState
                icon={FolderGit2}
                title="No portfolio projects listed"
                description="Showcase your capstone, hackathon, and open-source projects with live URLs and GitHub repository links."
                action={
                  <Button
                    variant="navy"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingProj(null);
                      setProjModalOpen(true);
                    }}
                  >
                    Add First Project
                  </Button>
                }
              />
            )}
          </div>

          {/* 3. Education Qualifications Section */}
          <div className="profile-section-block">
            <div className="section-head-row">
              <h3 className="section-head-title">
                <GraduationCap size={20} color="var(--blue-600)" />
                Education Qualifications ({educationList.length})
              </h3>
              <Button
                variant="navy"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingEdu(null);
                  setEduModalOpen(true);
                }}
              >
                Add Qualification
              </Button>
            </div>

            {educationList.length > 0 ? (
              educationList.map((edu) => (
                <EducationCard
                  key={edu._id}
                  item={edu}
                  onEdit={(item) => {
                    setEditingEdu(item);
                    setEduModalOpen(true);
                  }}
                  onDelete={handleDeleteEducation}
                />
              ))
            ) : (
              <EmptyState
                icon={GraduationCap}
                title="No education qualifications recorded"
                description="Add your college degree, specialization, graduation year, and CGPA/grade."
                action={
                  <Button
                    variant="navy"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingEdu(null);
                      setEduModalOpen(true);
                    }}
                  >
                    Add Education
                  </Button>
                }
              />
            )}
          </div>

          {/* 4. Professional Certifications Section */}
          <div className="profile-section-block">
            <div className="section-head-row">
              <h3 className="section-head-title">
                <Award size={20} color="var(--blue-600)" />
                Certifications & Badges ({certsList.length})
              </h3>
              <Button
                variant="navy"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setEditingCert(null);
                  setCertModalOpen(true);
                }}
              >
                Add Certification
              </Button>
            </div>

            {certsList.length > 0 ? (
              certsList.map((cert) => (
                <CertificationCard
                  key={cert._id}
                  cert={cert}
                  onEdit={(c) => {
                    setEditingCert(c);
                    setCertModalOpen(true);
                  }}
                  onDelete={handleDeleteCertification}
                />
              ))
            ) : (
              <EmptyState
                icon={Award}
                title="No certifications added yet"
                description="Upload certificates from AWS, Coursera, HackerRank, freeCodeCamp, or university honors."
                action={
                  <Button
                    variant="navy"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setEditingCert(null);
                      setCertModalOpen(true);
                    }}
                  >
                    Add Certification
                  </Button>
                }
              />
            )}
          </div>

        </div>

        {/* Modals */}
        <PersonalInfoModal
          isOpen={editPersonalOpen}
          onClose={() => setEditPersonalOpen(false)}
          initialData={profile}
          onSave={handleSavePersonalInfo}
        />

        <EducationModal
          isOpen={eduModalOpen}
          onClose={() => {
            setEduModalOpen(false);
            setEditingEdu(null);
          }}
          initialData={editingEdu}
          onSave={handleSaveEducation}
        />

        <ProjectModal
          isOpen={projModalOpen}
          onClose={() => {
            setProjModalOpen(false);
            setEditingProj(null);
          }}
          initialData={editingProj}
          onSave={handleSaveProject}
        />

        <CertificationModal
          isOpen={certModalOpen}
          onClose={() => {
            setCertModalOpen(false);
            setEditingCert(null);
          }}
          initialData={editingCert}
          onSave={handleSaveCertification}
        />

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          variant="danger"
          confirmText="Yes, Delete"
        />
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
