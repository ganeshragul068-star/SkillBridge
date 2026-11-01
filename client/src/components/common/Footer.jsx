import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ExternalLink, Code2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="container footer-container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <Compass size={22} />
              </div>
              <span className="footer-brand-title">SkillBridge</span>
            </div>
            <p className="footer-desc">
              Empowering college students and youth across India to discover skill gaps, master in-demand technical competencies, and land high-growth internships and graduate roles.
            </p>
            <div className="college-project-tag">
              🎓 College Full Stack Development Project
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Landing</Link></li>
              <li><Link to="/jobs">Jobs & Internships</Link></li>
              <li><Link to="/dashboard">Student Dashboard</Link></li>
              <li><Link to="/profile">Profile & Skills</Link></li>
            </ul>
          </div>

          {/* For Students */}
          <div className="footer-col">
            <h4 className="footer-heading">For Students</h4>
            <ul className="footer-links">
              <li><Link to="/register">Create Student Account</Link></li>
              <li><Link to="/login">Sign In to Portal</Link></li>
              <li><a href="#features">Skill Gap Matrix</a></li>
              <li><a href="#about">Employability Index</a></li>
            </ul>
          </div>

          {/* Technology & About */}
          <div className="footer-col">
            <h4 className="footer-heading">Tech Stack</h4>
            <div className="tech-pills">
              <span className="tech-pill">React.js</span>
              <span className="tech-pill">Node.js</span>
              <span className="tech-pill">Express.js</span>
              <span className="tech-pill">MongoDB Atlas</span>
              <span className="tech-pill">JavaScript ES6+</span>
              <span className="tech-pill">Vite</span>
            </div>
            <p className="footer-subtext">
              Phase 1: Frontend Architecture & UI Complete.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} SkillBridge – Youth Employability Platform. Built for College Full Stack Coursework.
          </p>
          <div className="footer-bottom-links">
            <span>Academic Prototype</span>
            <span>•</span>
            <span>Clean MERN Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
