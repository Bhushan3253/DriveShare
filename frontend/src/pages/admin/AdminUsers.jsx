import React, { useState, useEffect } from 'react';
import payoutService from '../../services/payoutService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { Users, Mail, Phone, Shield, Star, RefreshCw } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payoutService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Unable to load users directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>User Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Registered platform accounts, roles, host verification, and reputation scores
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            className="form-input"
            style={{ width: '220px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            placeholder="Search name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={fetchUsers} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {loading ? (
        <Loading message="Loading user directory..." />
      ) : filteredUsers.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Host / Owner</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: u.role === 'ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'var(--primary-light)',
                          color: u.role === 'ADMIN' ? '#F59E0B' : 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <strong>{u.name}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{u.id?.substring(Math.max(0, u.id.length - 6))}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p style={{ fontSize: '0.85rem' }}>{u.email}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'No phone'}</p>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.role === 'ADMIN' ? 'badge-pending' : 'badge-primary'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.carOwner ? (
                      <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>CAR OWNER</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Renter</span>
                    )}
                  </td>
                  <td>
                    {u.enabled !== false ? (
                      <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>Active</span>
                    ) : (
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Disabled</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: '#FBBF24', fontWeight: 600 }}>
                      <Star size={13} fill="#FBBF24" />
                      <span>{u.averageRating > 0 ? u.averageRating.toFixed(1) : '-'}</span>
                      {u.reviewCount > 0 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({u.reviewCount})</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No users found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Try refining your search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
