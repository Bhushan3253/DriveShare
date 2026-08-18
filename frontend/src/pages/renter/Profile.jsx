import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Shield, Car, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container section">
      <div className="container-md">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          <div className="flex items-center gap-4" style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)',
                color: '#FFFFFF',
                fontSize: '1.5rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--primary-glow)'
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
              <span className="badge badge-purple" style={{ marginTop: '0.25rem' }}>
                {user?.role} ACCOUNT
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>Email Address</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.email || 'N/A'}</p>
            </div>

            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                <Shield size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span>Account Status</span>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontWeight: 600, color: '#6EE7B7' }}>Active & Verified</span>
              </div>
            </div>
          </div>

          {/* Host CTA */}
          <div
            className="card flex items-center justify-between flex-wrap gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              <Car size={28} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Host on DriveShare</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Earn money sharing your idle car with verified drivers
                </p>
              </div>
            </div>

            <Link to="/owner/cars/add" className="btn btn-primary btn-sm">
              List Your Car
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
