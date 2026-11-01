import React, { useState } from 'react';
import { Menu, Bell, Search, Sparkles, User, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { studentProfile } from '../../data/mockData';
import './DashboardLayout.css';

const DashboardLayout = ({ children, pageTitle = 'Student Portal' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const displayName = user?.name || studentProfile.name;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const displayRole = user?.profile?.department || studentProfile.targetRole || 'Student';

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="dashboard-main-area">
        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>

            {/* Universal Step-by-Step Back Button */}
            <button
              type="button"
              className="topbar-back-btn"
              onClick={handleGoBack}
              title="Go back to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft size={16} />
              <span className="topbar-back-text">Back</span>
            </button>

            <div className="topbar-title-group">
              <span className="topbar-platform-badge">Student Employability Portal</span>
              <h1 className="topbar-page-title">{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-right">
            {/* Employability Score Pill */}
            <div className="topbar-score-pill" title="Current Employability Index">
              <Sparkles size={16} className="score-icon" />
              <div className="score-text">
                <span className="score-label">Readiness</span>
                <span className="score-value">{studentProfile.employabilityScore}%</span>
              </div>
            </div>

            {/* Profile shortcut */}
            <Link to="/profile" className="topbar-user-pill">
              <div className="user-pill-avatar">
                {initials}
              </div>
              <div className="user-pill-info">
                <span className="user-pill-name">{displayName}</span>
                <span className="user-pill-role">{displayRole}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="dashboard-inner-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
