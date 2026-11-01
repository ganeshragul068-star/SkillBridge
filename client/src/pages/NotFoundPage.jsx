import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import PublicLayout from '../layouts/PublicLayout';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <PublicLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--slate-100)', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Compass size={40} />
        </div>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          404 Error
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.5rem 0 1rem 0' }}>
          Page Not Found
        </h1>
        <p style={{ maxWidth: '480px', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          The page or career resource you are looking for doesn't exist or has moved. Return to the home page or your dashboard to continue.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/">
            <Button variant="navy" size="md" icon={Home}>
              Back to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="md" icon={LayoutDashboard}>
              Student Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
