import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Import All 20 Platform Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import JobMatchingPage from './pages/JobMatchingPage';
import SkillGapPage from './pages/SkillGapPage';
import CoursesPage from './pages/CoursesPage';
import MentorsPage from './pages/MentorsPage';
import AssessmentsPage from './pages/AssessmentsPage';
import TakeAssessmentPage from './pages/TakeAssessmentPage';
import AssessmentResultPage from './pages/AssessmentResultPage';
import LearningRoadmapPage from './pages/LearningRoadmapPage';
import LearningProgressPage from './pages/LearningProgressPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminJobsPage from './pages/AdminJobsPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import AdminAssessmentsPage from './pages/AdminAssessmentsPage';
import NotFoundPage from './pages/NotFoundPage';

import './styles/global.css';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing & Job Discovery Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />

            {/* Authentication Routes (Restricted: redirects if already logged in) */}
            <Route
              path="/register"
              element={
                <PublicRoute restricted={true}>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute restricted={true}>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Student Protected Routes (Requires role: 'student') */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-jobs"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SavedJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matching"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <JobMatchingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <LearningRoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-gap"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SkillGapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MentorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AssessmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/take/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TakeAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessments/result/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AssessmentResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning-progress"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <LearningProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-builder"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ResumeBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-analysis"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ResumeAnalysisPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes (Requires role: 'admin') */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assessments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAssessmentsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
