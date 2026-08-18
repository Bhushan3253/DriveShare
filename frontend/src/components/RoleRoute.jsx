import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Loading from './Loading';

const RoleRoute = ({ children, role }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verifying permissions..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRole(role)) {
    return (
      <div className="container section flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="card card-glass text-center" style={{ maxWidth: '500px', padding: '3rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-rose-light)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You do not have permission to view this page. This area requires <strong>{role}</strong> privileges.
          </p>
          <Link to="/" className="btn btn-primary" style={{ margin: '0 auto' }}>
            <ArrowLeft size={18} />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
