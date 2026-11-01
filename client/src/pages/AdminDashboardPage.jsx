import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Briefcase, FileCheck, Plus, ArrowRight, Building, Sparkles } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 1420,
    totalJobs: 48,
    totalApplications: 342,
    colleges: 18,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res?.data?.overview) {
          setStats(prev => ({
            ...prev,
            totalUsers: res.data.overview.totalUsers ?? prev.totalUsers,
            totalJobs: res.data.overview.totalJobs ?? prev.totalJobs,
            totalApplications: res.data.overview.totalApplications ?? prev.totalApplications,
          }));
        }
      } catch (err) {
        // Fallback to initial display stats if backend offline
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <PublicLayout>
      <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
        <PageHeader
          title={`Campus Admin Console — Welcome, ${user?.name || 'Administrator'}`}
          description={`Logged in as ${user?.email || 'admin@skillbridge.edu'} with role: ${user?.role || 'admin'}. Institutional control panel for college placement officers and corporate recruiters.`}
          badge="Admin Console"
          isPhase1Preview={false}
          actions={
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/jobs">
                <Button variant="navy" size="sm" icon={Plus}>
                  Post New Opportunity
                </Button>
              </Link>
              <Link to="/admin/applications">
                <Button variant="secondary" size="sm" icon={FileCheck}>
                  Review Applications
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <StatCard title="Total Students" value={stats.totalUsers.toLocaleString()} subtitle="Enrolled in placement" icon={Users} variant="blue" />
          <StatCard title="Active Listings" value={stats.totalJobs.toLocaleString()} subtitle="Internships & roles" icon={Briefcase} variant="navy" />
          <StatCard title="Applications" value={stats.totalApplications.toLocaleString()} subtitle="Total submitted" icon={FileCheck} variant="amber" />
          <StatCard title="Colleges Joined" value={stats.colleges.toLocaleString()} subtitle="Partner campuses" icon={Building} variant="emerald" />
        </div>

        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Recent Job Postings</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>Active opportunities visible to student applicants</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>Frontend React Developer Intern</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-500)' }}>TechNova Labs • 42 Applicants</span>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>Junior MERN Stack Developer</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--slate-500)' }}>NextGen Solutions • 18 Applicants</span>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Employability Skill Gaps Found on Campus</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>Top skill deficiencies identified among enrolled batches</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Docker & Containers</span>
                <strong style={{ color: 'var(--danger)' }}>68% lacking</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Unit Testing (Jest / RTL)</span>
                <strong style={{ color: 'var(--danger)' }}>61% lacking</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span>MongoDB Complex Aggregations</span>
                <strong style={{ color: 'var(--warning)' }}>48% lacking</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AdminDashboardPage;
