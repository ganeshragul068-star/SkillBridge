import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, GraduationCap, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import FormInput from '../components/common/FormInput';
import SelectField from '../components/common/SelectField';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import './AuthPages.css';

const departmentOptions = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Computer Applications (BCA / MCA)',
  'Data Science & Artificial Intelligence'
];

const degreeOptions = [
  'B.Tech / B.E. (Bachelor of Technology)',
  'BCA (Bachelor of Computer Applications)',
  'B.Sc (Computer Science / IT)',
  'MCA (Master of Computer Applications)',
  'M.Tech (Master of Technology)'
];

const graduationYearOptions = ['2025', '2026', '2027', '2028', '2029'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech / B.E. (Bachelor of Technology)',
    graduationYear: '2026',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.college.trim() || !formData.department) {
      setFormError('Please fill in all required academic fields.');
      showToast('Please fill in all required academic fields.', 'error');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError('Please provide a valid college or personal email address.');
      showToast('Please provide a valid email address.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.');
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (!formData.agreeTerms) {
      setFormError('Please agree to the student terms of service.');
      showToast('Please agree to the terms of service.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        college: formData.college.trim(),
        department: formData.department,
        degree: formData.degree,
        graduationYear: formData.graduationYear
      });

      showToast('Student account created successfully! Welcome to SkillBridge.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const msg = error.message || 'Registration failed. Please check your information.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="auth-page-root">
        <div className="auth-card-container">
          {/* Form Side */}
          <div className="auth-form-side">
            <div className="auth-header">
              <h1 className="auth-title">Create Student Account</h1>
              <p className="auth-subtitle">
                Join SkillBridge to assess skill gaps, get learning roadmaps, and land verified internships.
              </p>
            </div>

            {formError && (
              <div style={{
                backgroundColor: 'var(--danger-bg, #fee2e2)',
                color: 'var(--danger, #dc2626)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                border: '1px solid #fca5a5'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <FormInput
                label="Full Name"
                name="name"
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
              />

              <FormInput
                label="College Email Address"
                name="email"
                type="email"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
                helperText="Your email will be your account login ID"
              />

              <FormInput
                label="College / University Name"
                name="college"
                placeholder="e.g. National Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                icon={Building}
                required
              />

              <div className="form-row-2">
                <SelectField
                  label="Department / Branch"
                  name="department"
                  options={departmentOptions}
                  value={formData.department}
                  onChange={handleChange}
                  required
                />

                <SelectField
                  label="Expected Graduation Year"
                  name="graduationYear"
                  options={graduationYearOptions}
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <SelectField
                label="Degree Program"
                name="degree"
                options={degreeOptions}
                value={formData.degree}
                onChange={handleChange}
              />

              <div className="form-row-2">
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  required
                />

                <FormInput
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  required
                />
              </div>

              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <span>
                  I agree to SkillBridge's student code of conduct and career analytics terms.
                </span>
              </label>

              <Button
                type="submit"
                variant="navy"
                size="lg"
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
                disabled={submitting}
              >
                {submitting ? 'Creating Student Account...' : 'Register Student Account'}
              </Button>

              <div className="auth-footer-prompt">
                Already registered? <Link to="/login">Sign In here</Link>
              </div>
            </form>
          </div>

          {/* Benefits Side */}
          <div className="auth-benefits-side">
            <div>
              <h2 className="benefits-title">Why Join SkillBridge?</h2>
              <p className="benefits-desc">
                Designed to make freshers career-ready by turning classroom theories into recruiter-recognized competencies.
              </p>

              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon-box">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4>Automated Skill-Gap Analysis</h4>
                    <p>Know exactly which missing libraries or frameworks stand between you and your target job.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon-box">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4>Fresher-First Opportunities</h4>
                    <p>Curated internships without unreal "3 years experience required" hurdles.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon-box">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4>ATS Resume Optimization</h4>
                    <p>Structure your college projects with quantifiable metrics recruiters search for.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-demo-badge">
              <strong>Secure Student Registration:</strong> Your password is cryptographically hashed with bcrypt before saving to MongoDB Atlas.
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;
