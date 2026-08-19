import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users,
  Mail,
  Phone,
  Shield,
  Star,
  RefreshCw,
  FileCheck,
  CheckCircle2,
  XCircle,
  Ban,
  Unlock,
  Download,
  Eye,
  X,
  ExternalLink,
  Car,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabFilter, setTabFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // KYC Inspection Modal
  const [inspectKycUser, setInspectKycUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // User Dossier Modal
  const [dossierUser, setDossierUser] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAllUsers();
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

  // Filter logic
  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (tabFilter === 'PENDING_KYC' && u.kycStatus !== 'PENDING_VERIFICATION') return false;
    if (tabFilter === 'VERIFIED_DRIVERS' && u.kycStatus !== 'VERIFIED') return false;
    if (tabFilter === 'HOSTS' && !u.carOwner) return false;
    if (tabFilter === 'DISABLED' && u.enabled !== false) return false;

    // Search filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term) ||
      u.drivingLicenseNumber?.toLowerCase().includes(term)
    );
  });

  const handleApproveKyc = async (userId) => {
    try {
      setActionLoading(userId);
      const updated = await userService.approveUserKyc(userId);
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
      if (inspectKycUser && inspectKycUser.id === userId) {
        setInspectKycUser(updated);
      }
      toast.success('Renter driving license verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectKyc = async (e) => {
    e.preventDefault();
    if (!inspectKycUser || !rejectReason) return;

    try {
      setActionLoading(inspectKycUser.id);
      const updated = await userService.rejectUserKyc(inspectKycUser.id, rejectReason);
      setUsers(users.map((u) => (u.id === inspectKycUser.id ? updated : u)));
      setInspectKycUser(null);
      setRejectModalOpen(false);
      toast.warning('KYC has been rejected with feedback.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(userId);
      const updated = await userService.toggleUserStatus(userId);
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
      toast.info(`User account ${updated.enabled ? 'activated' : 'suspended'}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle account status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      setActionLoading(userId);
      const updated = await userService.updateUserRole(userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
      toast.success(`User role updated to ${newRole}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setActionLoading(null);
    }
  };

  const openDossier = async (user) => {
    try {
      setDossierUser(user);
      setDossierLoading(true);
      const data = await userService.getUserDossier(user.id);
      setDossierData(data);
    } catch (err) {
      toast.error('Unable to fetch user activity dossier.');
    } finally {
      setDossierLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!filteredUsers.length) {
      toast.warning('No user data to export.');
      return;
    }

    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Is Host', 'KYC Status', 'DL Number', 'Status', 'Rating'];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.role || 'USER'}"`,
      u.carOwner ? 'Yes' : 'No',
      `"${u.kycStatus || 'NOT_SUBMITTED'}"`,
      `"${u.drivingLicenseNumber || ''}"`,
      u.enabled !== false ? 'Active' : 'Disabled',
      u.averageRating || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DriveShare_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('User directory exported to CSV!');
  };

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>User Management & KYC</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Inspect driver licenses, moderate accounts, manage roles, and review user dossiers
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <input
            type="text"
            className="form-input"
            style={{ width: '220px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            placeholder="Search name, email, DL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Export CSV */}
          <button onClick={exportToCSV} className="btn btn-secondary btn-sm flex items-center gap-1.5" title="Export CSV">
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Refresh */}
          <button onClick={fetchUsers} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        {[
          { key: 'ALL', label: 'All Users' },
          { key: 'PENDING_KYC', label: 'Pending KYC Review' },
          { key: 'VERIFIED_DRIVERS', label: 'Verified Drivers' },
          { key: 'HOSTS', label: 'Car Hosts' },
          { key: 'DISABLED', label: 'Disabled / Suspended' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setTabFilter(tab.key);
              setCurrentPage(1);
            }}
            className={`btn btn-sm ${tabFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {loading ? (
        <Loading message="Loading user directory & verification queues..." />
      ) : filteredUsers.length > 0 ? (
        <div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Driver KYC</th>
                  <th>Account</th>
                  <th>Rating</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const isPendingKyc = u.kycStatus === 'PENDING_VERIFICATION';
                  const isVerifiedDriver = u.kycStatus === 'VERIFIED';
                  const isRejectedKyc = u.kycStatus === 'REJECTED';

                  return (
                    <tr key={u.id}>
                      {/* User Avatar + Name */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: u.role === 'ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'var(--primary-light)',
                              color: u.role === 'ADMIN' ? '#F59E0B' : 'var(--primary)',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <strong
                              onClick={() => openDossier(u)}
                              style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                              className="hover:underline"
                            >
                              {u.name}
                            </strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              #{u.id?.substring(Math.max(0, u.id.length - 6))}
                              {u.carOwner && <span style={{ color: 'var(--accent-emerald)', marginLeft: '6px' }}>• Host</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div>
                          <p style={{ fontSize: '0.85rem' }}>{u.email}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phone || 'No phone'}</p>
                        </div>
                      </td>

                      {/* Role & Role Toggle */}
                      <td>
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className={`badge ${u.role === 'ADMIN' ? 'badge-pending' : 'badge-primary'}`}
                          style={{ fontSize: '0.7rem', cursor: 'pointer', border: 'none' }}
                          title="Click to toggle role"
                        >
                          {u.role}
                        </button>
                      </td>

                      {/* Driver KYC Status */}
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          {isVerifiedDriver && (
                            <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>
                              ✓ Verified DL
                            </span>
                          )}
                          {isPendingKyc && (
                            <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                              ⏳ Review DL
                            </span>
                          )}
                          {isRejectedKyc && (
                            <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                              ✕ DL Rejected
                            </span>
                          )}
                          {!u.kycStatus || u.kycStatus === 'NOT_SUBMITTED' ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No DL submitted</span>
                          ) : null}

                          {u.drivingLicenseUrl && (
                            <button
                              onClick={() => setInspectKycUser(u)}
                              className="btn btn-secondary btn-sm flex items-center gap-1"
                              style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginTop: '2px' }}
                            >
                              <Eye size={11} />
                              <span>Inspect DL</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Account Enabled */}
                      <td>
                        {u.enabled !== false ? (
                          <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>Active</span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Suspended</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td>
                        <div className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: '#FBBF24', fontWeight: 600 }}>
                          <Star size={13} fill="#FBBF24" />
                          <span>{u.averageRating > 0 ? u.averageRating.toFixed(1) : '-'}</span>
                          {u.reviewCount > 0 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({u.reviewCount})</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {/* User Dossier */}
                          <button
                            onClick={() => openDossier(u)}
                            className="btn btn-secondary btn-sm"
                            title="View User Dossier & History"
                          >
                            <Users size={13} />
                          </button>

                          {/* Quick KYC Approve */}
                          {isPendingKyc && (
                            <button
                              onClick={() => handleApproveKyc(u.id)}
                              disabled={actionLoading === u.id}
                              className="btn btn-success btn-sm flex items-center gap-1"
                              title="Approve Driver KYC"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}

                          {/* Ban / Unban Toggle */}
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            disabled={actionLoading === u.id}
                            className={`btn btn-sm ${u.enabled === false ? 'btn-secondary' : 'btn-outline'}`}
                            style={u.enabled !== false ? { color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)' } : {}}
                            title={u.enabled !== false ? 'Suspend User' : 'Restore User'}
                          >
                            {u.enabled !== false ? <Ban size={13} /> : <Unlock size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No users found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Try refining your search term or selecting a different tab.
          </p>
        </div>
      )}

      {/* INSPECT KYC DRIVING LICENSE MODAL */}
      {inspectKycUser && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Driving License Verification</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {inspectKycUser.name} ({inspectKycUser.email})
                </p>
              </div>
              <button
                onClick={() => setInspectKycUser(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* DL Metadata */}
            <div className="grid grid-cols-2 gap-3" style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DL Number</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                  {inspectKycUser.drivingLicenseNumber || 'Not specified'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Expiry Date</span>
                <strong style={{ fontSize: '0.95rem' }}>
                  {inspectKycUser.drivingLicenseExpiry ? formatDate(inspectKycUser.drivingLicenseExpiry) : 'Standard Valid'}
                </strong>
              </div>
            </div>

            {/* Document Photo */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {inspectKycUser.drivingLicenseUrl ? (
                <div style={{ position: 'relative', maxHeight: '280px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000' }}>
                  <img
                    src={inspectKycUser.drivingLicenseUrl}
                    alt="Driving License Scan"
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }}
                  />
                  <a
                    href={inspectKycUser.drivingLicenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={12} /> View Full Resolution
                  </a>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No license document uploaded.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => {
                  setRejectReason('');
                  setRejectModalOpen(true);
                }}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                <XCircle size={14} />
                <span>Reject KYC</span>
              </button>

              {inspectKycUser.kycStatus !== 'VERIFIED' && (
                <button
                  type="button"
                  onClick={() => handleApproveKyc(inspectKycUser.id)}
                  disabled={actionLoading === inspectKycUser.id}
                  className="btn btn-success btn-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve Driving Privileges</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT KYC MODAL */}
      {rejectModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Reject Driver KYC</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Provide the user with specific feedback on why their driving license could not be approved.
            </p>

            <div className="flex gap-2 flex-wrap" style={{ marginBottom: '1rem' }}>
              {[
                'Blurry photo or unreadable license number',
                'Expired driving license document',
                'Name on license does not match account',
                'Incomplete document scan'
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => setRejectReason(template)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                >
                  + {template}
                </button>
              ))}
            </div>

            <form onSubmit={handleRejectKyc}>
              <div className="form-group">
                <label className="form-label">Rejection Note *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="e.g. Please re-upload a clear photo where the license number is visible..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === inspectKycUser?.id}
                  className="btn btn-danger"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DOSSIER MODAL */}
      {dossierUser && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {dossierUser.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{dossierUser.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {dossierUser.email} • {dossierUser.phone || 'No phone'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDossierUser(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {dossierLoading ? (
              <Loading message="Compiling user activity dossier..." />
            ) : dossierData ? (
              <div>
                {/* 360 Financial Metrics */}
                <div className="grid grid-cols-4 gap-3" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trips Rented</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>
                      {dossierData.totalBookings || 0}
                    </h3>
                  </div>
                  <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gross Spent</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {formatCurrency(dossierData.totalSpent || 0)}
                    </h3>
                  </div>
                  <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fleet Cars</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>
                      {dossierData.totalCars || 0}
                    </h3>
                  </div>
                  <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host Earnings</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                      {formatCurrency(dossierData.totalEarned || 0)}
                    </h3>
                  </div>
                </div>

                {/* Rental History Snippet */}
                {dossierData.renterBookings && dossierData.renterBookings.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Recent Rental Reservations ({dossierData.renterBookings.length})
                    </h4>
                    <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Booking</th>
                            <th>Dates</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dossierData.renterBookings.slice(0, 5).map((b) => (
                            <tr key={b.id}>
                              <td>#{b.id.substring(Math.max(0, b.id.length - 6))}</td>
                              <td>{formatDate(b.startDate)} - {formatDate(b.endDate)}</td>
                              <td>{formatCurrency(b.totalAmount || b.totalPrice)}</td>
                              <td><StatusBadge status={b.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fleet Cars Snippet */}
                {dossierData.ownedCars && dossierData.ownedCars.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Listed Fleet Vehicles ({dossierData.ownedCars.length})
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {dossierData.ownedCars.map((c) => (
                        <div key={c.id} style={{ background: 'var(--bg-surface-raised)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                          <strong>{c.brand} {c.model}</strong> ({c.year}) • <StatusBadge status={c.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

