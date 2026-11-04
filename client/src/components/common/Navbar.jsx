import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  ArrowRight,
  User,
  Briefcase,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  FileText,
  FileCheck
} from 'lucide-react';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    closeMenu();
    await logout();
    showToast('Logged out of SkillBridge.', 'info');
    navigate('/', { replace: true });
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Left Brand & Step-by-Step Back Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {location.pathname !== '/' && (
            <button
              type="button"
              className="navbar-back-btn"
              onClick={() => navigate(-1)}
              title="Go back to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft size={16} />
              <span className="navbar-back-text">Back</span>
            </button>
          )}

          {/* Brand Logo */}
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-icon-box">
              <Compass size={22} className="brand-compass" />
            </div>
            <div className="brand-text-group">
              <span className="brand-name">Skill<span className="brand-name-highlight">Bridge</span></span>
              <span className="brand-tagline">Youth Employability</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
            Jobs & Internships
          </Link>

          {/* Student Specific Links */}
          {isAuthenticated && user?.role === 'student' && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Student Dashboard
              </Link>
              <Link to="/resume-builder" className={`nav-link ${isActive('/resume-builder') ? 'active' : ''}`}>
                Resume Builder
              </Link>
              <Link to="/resume-analysis" className={`nav-link ${isActive('/resume-analysis') ? 'active' : ''}`}>
                Resume Analyzer
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                Profile
              </Link>
            </>
          )}

          {/* Admin Specific Links */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                Admin Portal
              </Link>
              <Link to="/admin/jobs" className={`nav-link ${isActive('/admin/jobs') ? 'active' : ''}`}>
                Manage Jobs
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="navbar-actions desktop-actions">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--slate-100)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--navy-900)'
                }}
              >
                {user.role === 'admin' ? <ShieldCheck size={16} color="var(--primary)" /> : <User size={16} />}
                <span>{user.name}</span>
                <span className="badge badge-navy" style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </Link>

              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="navy" size="sm" icon={ArrowRight} iconPosition="right">
                  Register Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
              Home
            </Link>
            <Link to="/jobs" className={`mobile-nav-link ${isActive('/jobs') ? 'active' : ''}`} onClick={closeMenu}>
              <Briefcase size={18} />
              Jobs & Internships
            </Link>

            {isAuthenticated && user?.role === 'student' && (
              <>
                <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={closeMenu}>
                  <LayoutDashboard size={18} />
                  Student Dashboard
                </Link>
                <Link to="/resume-builder" className={`mobile-nav-link ${isActive('/resume-builder') ? 'active' : ''}`} onClick={closeMenu}>
                  <FileText size={18} />
                  AI Resume Builder
                </Link>
                <Link to="/resume-analysis" className={`mobile-nav-link ${isActive('/resume-analysis') ? 'active' : ''}`} onClick={closeMenu}>
                  <FileCheck size={18} />
                  AI Resume Analyzer
                </Link>
                <Link to="/profile" className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={closeMenu}>
                  <User size={18} />
                  Student Profile
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link to="/admin" className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={closeMenu}>
                  <ShieldCheck size={18} />
                  Admin Dashboard
                </Link>
                <Link to="/admin/jobs" className={`mobile-nav-link ${isActive('/admin/jobs') ? 'active' : ''}`} onClick={closeMenu}>
                  <Briefcase size={18} />
                  Manage Jobs
                </Link>
              </>
            )}
          </nav>

          <div className="mobile-drawer-actions">
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                    Signed in as {user.name} ({user.role})
                  </span>
                </div>
                <Button variant="outline" size="md" fullWidth icon={LogOut} onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" size="md" fullWidth>
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button variant="navy" size="md" fullWidth>
                    Create Free Student Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
