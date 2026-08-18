import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, ShieldCheck, Key, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerProfile = () => {
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
                justifyContent: 'center'
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'H'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
              <span className="badge badge-purple" style={{ marginTop: '0.25rem' }}>
                Verified Host / Owner
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email Address</span>
              <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.25rem' }}>{user?.email || 'N/A'}</p>
            </div>

            <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Host Status</span>
              <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
                <span style={{ fontWeight: 600, color: '#6EE7B7' }}>Active & Eligible for Payouts</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <Link to="/owner/cars" className="btn btn-secondary flex items-center gap-2">
              <Key size={16} />
              <span>Manage Fleet</span>
            </Link>
            <Link to="/owner/earnings" className="btn btn-primary flex items-center gap-2">
              <DollarSign size={16} />
              <span>View Settlements</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
