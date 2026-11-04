import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Briefcase,
  UserCheck,
  BookmarkCheck,
  Compass,
  FileText,
  FileCheck,
  LogOut,
  X,
  Sparkles,
  BookOpen,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const studentNavItems = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Skill Assessments', path: '/assessments', icon: Award },
    { name: 'Learning Progress', path: '/learning-progress', icon: TrendingUp },
    { name: 'Smart Job Matching', path: '/matching', icon: Sparkles },
    { name: 'Skill Gap Matrix', path: '/skill-gap', icon: Target },
    { name: 'Learning Roadmap', path: '/roadmap', icon: Compass },
    { name: 'Curated Courses', path: '/courses', icon: BookOpen },
    { name: 'AI Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'AI Resume Analyzer', path: '/resume-analysis', icon: FileCheck },
    { name: 'Mentor Matching', path: '/mentors', icon: Users },
    { name: 'Browse All Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Student Profile & Skills', path: '/profile', icon: UserCheck }
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Job Listings', path: '/admin/jobs', icon: Briefcase },
    { name: 'Review Applications', path: '/admin/applications', icon: FileText },
    { name: 'Assessment Console', path: '/admin/assessments', icon: Award },
    { name: 'AI Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'AI Resume Analyzer', path: '/resume-analysis', icon: FileCheck }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    showToast('Logged out of SkillBridge.', 'info');
    navigate('/', { replace: true });
  };

  const displayName = user?.name || 'Student';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const collegeInfo = user?.profile?.college
    ? `${user.role.toUpperCase()} • ${user.profile.college.slice(0, 20)}`
    : `${user?.role ? user.role.toUpperCase() : 'STUDENT'}`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`dashboard-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Compass size={20} />
            </div>
            <div className="sidebar-brand-text">
              <span>Skill<span className="brand-highlight">Bridge</span></span>
              <span className="sidebar-brand-sub">Portal</span>
            </div>
          </Link>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-menu-wrapper">
          <span className="sidebar-section-title">MAIN NAVIGATION</span>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} className="sidebar-link-icon" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <span className="sidebar-section-title">QUICK ACCESS</span>
          <nav className="sidebar-nav">
            <Link to="/saved-jobs" className="sidebar-link" onClick={onClose}>
              <BookmarkCheck size={18} className="sidebar-link-icon" />
              <span>Saved Jobs</span>
            </Link>
            <Link to="/applications" className="sidebar-link" onClick={onClose}>
              <FileText size={18} className="sidebar-link-icon" />
              <span>My Applications</span>
            </Link>
            <Link to="/skill-gap" className="sidebar-link" onClick={onClose}>
              <Target size={18} className="sidebar-link-icon" />
              <span>Skill Gap Matrix</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">{displayName}</span>
              <span className="sidebar-user-role">{collegeInfo}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            title="Sign out of account"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
