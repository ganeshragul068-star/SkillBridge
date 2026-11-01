import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  Briefcase,
  Compass,
  FileCheck,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Award,
  Users,
  Building2,
  GraduationCap
} from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import Button from '../components/common/Button';
import FeatureCard from '../components/common/FeatureCard';
import JobCard from '../components/common/JobCard';
import { platformFeatures, sampleJobs } from '../data/mockData';
import './LandingPage.css';

const LandingPage = () => {
  const featuredJobs = sampleJobs.slice(0, 3);

  return (
    <PublicLayout>
      <div className="landing-root">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={14} className="hero-badge-icon" />
                <span>Next-Gen Youth Employability Platform</span>
              </div>

              <h1 className="hero-title">
                Bridge the Gap Between <span className="highlight-text">College Degrees</span> & Industry Careers
              </h1>

              <p className="hero-subtitle">
                Thousands of Indian college students face an employability deficit between classroom theory and real-world tech demands. SkillBridge maps your coursework against industry requirements, closes skill gaps, and unlocks verified fresher jobs.
              </p>

              <div className="hero-cta-group">
                <Link to="/register">
                  <Button variant="navy" size="lg" icon={ArrowRight} iconPosition="right">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="secondary" size="lg" icon={Briefcase}>
                    Explore Opportunities
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="hero-trust-badges">
                <div className="trust-item">
                  <CheckCircle size={16} className="trust-icon" />
                  <span>Curated for College Freshers</span>
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} className="trust-icon" />
                  <span>AI Skill Gap Mapping</span>
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} className="trust-icon" />
                  <span>100% Free for Students</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card / Employability Index Preview */}
            <div className="hero-visual">
              <div className="hero-card-preview">
                <div className="preview-header">
                  <div className="preview-profile">
                    <div className="preview-avatar">AJ</div>
                    <div>
                      <h4 className="preview-name">Alex Johnson</h4>
                      <p className="preview-sub">3rd Year B.Tech • Computer Science</p>
                    </div>
                  </div>
                  <span className="preview-score-badge">78% Employable</span>
                </div>

                <div className="preview-divider" />

                <div className="preview-role-target">
                  <span className="target-label">Target Role</span>
                  <span className="target-role-badge">MERN Stack Developer</span>
                </div>

                <div className="preview-skills-status">
                  <div className="status-col">
                    <span className="status-label text-success">✓ Acquired Skills (12)</span>
                    <div className="skill-pills">
                      <span className="skill-pill-sm pill-success">React.js</span>
                      <span className="skill-pill-sm pill-success">Node.js</span>
                      <span className="skill-pill-sm pill-success">JavaScript</span>
                      <span className="skill-pill-sm pill-success">Git</span>
                    </div>
                  </div>

                  <div className="status-col">
                    <span className="status-label text-danger">! High-Priority Gaps (4)</span>
                    <div className="skill-pills">
                      <span className="skill-pill-sm pill-gap">Docker</span>
                      <span className="skill-pill-sm pill-gap">MongoDB Aggregations</span>
                      <span className="skill-pill-sm pill-gap">Jest Testing</span>
                    </div>
                  </div>
                </div>

                <div className="preview-match-alert">
                  <Award size={18} className="alert-award-icon" />
                  <p>
                    <strong>3 Matching Internships Found:</strong> Closing Docker & Testing increases eligibility to 94%!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Numbers Banner */}
        <section className="stats-strip">
          <div className="container stats-container">
            <div className="stat-box">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Students Guided</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-box">
              <span className="stat-number">500+</span>
              <span className="stat-label">Hiring Partners</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-box">
              <span className="stat-number">92%</span>
              <span className="stat-label">Internship Placement Rate</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-box">
              <span className="stat-number">350+</span>
              <span className="stat-label">Tech Skills Benchmarked</span>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="about" className="how-it-works-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-eyebrow">The Employability Pipeline</span>
              <h2 className="section-title">How SkillBridge Accelerates Your Career</h2>
              <p className="section-desc">
                From college classroom to first offer letter in 3 structured milestones.
              </p>
            </div>

            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon-box">
                  <Target size={24} />
                </div>
                <h3 className="step-title">Discover Skill Gaps</h3>
                <p className="step-desc">
                  Input your college curriculum and desired technical role. Our algorithms analyze job descriptions to pinpoint missing proficiencies.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">02</div>
                <div className="step-icon-box">
                  <Compass size={24} />
                </div>
                <h3 className="step-title">Learn & Close Gaps</h3>
                <p className="step-desc">
                  Follow curated roadmaps, high-yield free tutorials, and mini projects designed to turn weakness into demonstrable GitHub proof.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon-box">
                  <Briefcase size={24} />
                </div>
                <h3 className="step-title">Land Verified Jobs</h3>
                <p className="step-desc">
                  Apply directly to companies actively recruiting student freshers, backed by an ATS-optimized resume and verified readiness index.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Comprehensive Toolkit</span>
                <h2 className="section-title">Designed for College Students & Freshers</h2>
              </div>
              <p className="section-desc-right">
                Everything you need to turn theoretical engineering or computer application studies into high-paying job opportunities.
              </p>
            </div>

            <div className="grid-3 features-grid">
              {platformFeatures.map((feat) => (
                <FeatureCard
                  key={feat.id}
                  title={feat.title}
                  description={feat.description}
                  icon={feat.icon}
                  tag={feat.tag}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Opportunities Preview */}
        <section className="featured-jobs-section">
          <div className="container">
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">Direct Hiring</span>
                <h2 className="section-title">Latest Fresher Internships & Jobs</h2>
                <p className="section-desc">
                  Handpicked roles actively looking for 2024 - 2027 college graduates.
                </p>
              </div>
              <Link to="/jobs">
                <Button variant="outline" size="md" icon={ArrowRight} iconPosition="right">
                  View All Listings
                </Button>
              </Link>
            </div>

            <div className="jobs-preview-grid">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="cta-banner-section">
          <div className="container">
            <div className="cta-banner-box">
              <div className="cta-content">
                <h2 className="cta-title">Ready to Benchmark Your Employability?</h2>
                <p className="cta-desc">
                  Join thousands of college students bridging the gap today. Get your free personalized skill gap audit in less than 2 minutes.
                </p>
                <div className="cta-buttons">
                  <Link to="/register">
                    <Button variant="navy" size="lg" icon={ArrowRight} iconPosition="right">
                      Create Student Profile
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In to Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
