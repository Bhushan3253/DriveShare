import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Car,
  CheckCircle2,
  XCircle,
  Ban,
  Unlock,
  Filter,
  RefreshCw,
  MapPin,
  Star,
  FileCheck,
  FileText,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Eye,
  X
} from 'lucide-react';

const AdminCars = () => {
  const toast = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State for Reject / Block Reason
  const [modalType, setModalType] = useState(null); // 'REJECT' or 'BLOCK'
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [reason, setReason] = useState('');

  // Document Verification Inspection Modal State
  const [inspectCar, setInspectCar] = useState(null);
  const [previewDocUrl, setPreviewDocUrl] = useState(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      const statusParam = statusFilter === 'ALL' ? '' : statusFilter;
      const data = await carService.getAdminCars(statusParam);
      setCars(data || []);
    } catch (err) {
      console.error('Error fetching admin cars:', err);
      setError('Unable to load cars for moderation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchCars();
  }, [statusFilter]);

  const handleApprove = async (carId) => {
    try {
      setActionLoading(carId);
      const updated = await carService.approveCar(carId);
      setCars(cars.map((c) => (c.id === carId ? updated : c)));
      if (inspectCar && inspectCar.id === carId) {
        setInspectCar(updated);
      }
      toast.success('Vehicle approved for public rental!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (carId) => {
    try {
      setActionLoading(carId);
      const updated = await carService.unblockCar(carId);
      setCars(cars.map((c) => (c.id === carId ? updated : c)));
      if (inspectCar && inspectCar.id === carId) {
        setInspectCar(updated);
      }
      toast.success('Vehicle unblocked successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unblock failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const openReasonModal = (type, carId) => {
    setModalType(type);
    setSelectedCarId(carId);
    setReason('');
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCarId || !reason) return;

    try {
      setActionLoading(selectedCarId);
      let updated;
      if (modalType === 'REJECT') {
        updated = await carService.rejectCar(selectedCarId, reason);
        toast.warning('Vehicle listing rejected.');
      } else if (modalType === 'BLOCK') {
        updated = await carService.blockCar(selectedCarId, reason);
        toast.warning('Vehicle blocked.');
      }

      setCars(cars.map((c) => (c.id === selectedCarId ? updated : c)));
      if (inspectCar && inspectCar.id === selectedCarId) {
        setInspectCar(updated);
      }
      setModalType(null);
    } catch (err) {
      toast.error(err.response?.data?.message || `${modalType} action failed.`);
    } finally {
      setActionLoading(null);
    }
  };

  const isDateExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const paginatedCars = cars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fleet Moderation & Approvals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review host vehicle submissions, verify RC & insurance certificates, approve active listings, and manage policy blocks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1" style={{ background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : ''}`}
                style={{
                  background: statusFilter === status ? undefined : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem'
                }}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <button onClick={fetchCars} className="btn btn-secondary btn-sm flex items-center gap-1">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCars} />}

      {loading ? (
        <Loading message="Fetching cars for admin moderation..." />
      ) : cars.length > 0 ? (
        <div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle & Plate</th>
                  <th>Location</th>
                  <th>Compliance Docs</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCars.map((car) => {
                  const hasRc = !!car.rcDocUrl;
                  const hasInsurance = !!car.insuranceDocUrl;
                  const insuranceExpired = isDateExpired(car.insuranceExpiry);

                  return (
                    <tr key={car.id}>
                      {/* Vehicle Column with Registration Plate */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            style={{
                              width: '56px',
                              height: '42px',
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              background: 'var(--bg-surface-raised)',
                              flexShrink: 0
                            }}
                          >
                            {car.imageUrl ? (
                              <img
                                src={car.imageUrl}
                                alt={car.model}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted">
                                <Car size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {car.brand} {car.model}
                            </div>
                            <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
                              {car.registrationNumber ? (
                                <span className="badge badge-purple" style={{ fontSize: '0.7rem', letterSpacing: '0.5px', padding: '0.1rem 0.4rem' }}>
                                  {car.registrationNumber}
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>No Plate</span>
                              )}
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {car.year} • {car.fuelType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td>
                        <div className="flex items-center gap-1" style={{ fontSize: '0.85rem' }}>
                          <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span>{car.location || 'Not Specified'}</span>
                        </div>
                      </td>

                      {/* Compliance Documents Column */}
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`badge ${hasRc ? 'badge-active' : 'badge-inactive'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              RC {hasRc ? '✓' : '✗'}
                            </span>
                            <span
                              className={`badge ${hasInsurance ? (insuranceExpired ? 'badge-inactive' : 'badge-active') : 'badge-inactive'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              Ins {hasInsurance ? (insuranceExpired ? 'Expired' : '✓') : '✗'}
                            </span>
                          </div>
                          <button
                            onClick={() => setInspectCar(car)}
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginTop: '2px' }}
                          >
                            <Eye size={12} />
                            <span>Verify Docs</span>
                          </button>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {formatCurrency(car.pricePerDay)}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per day</span>
                      </td>

                      {/* Status */}
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={car.status} />
                          {car.rejectionReason && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)' }}>
                              Note: {car.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatDate(car.createdAt)}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve Button */}
                          {car.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApprove(car.id)}
                              disabled={actionLoading === car.id}
                              className="btn btn-success btn-sm flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Reject Button */}
                          {car.status !== 'REJECTED' && (
                            <button
                              onClick={() => openReasonModal('REJECT', car.id)}
                              disabled={actionLoading === car.id}
                              className="btn btn-outline btn-sm flex items-center gap-1"
                              style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          )}

                          {/* Block / Unblock Button */}
                          {car.status === 'BLOCKED' ? (
                            <button
                              onClick={() => handleUnblock(car.id)}
                              disabled={actionLoading === car.id}
                              className="btn btn-secondary btn-sm flex items-center gap-1"
                            >
                              <Unlock size={13} />
                              <span>Unblock</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openReasonModal('BLOCK', car.id)}
                              disabled={actionLoading === car.id}
                              className="btn btn-outline btn-sm"
                              title="Block car"
                            >
                              <Ban size={13} />
                            </button>
                          )}
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
            totalItems={cars.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <Car size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No cars found in this filter</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Try selecting a different status filter above.
          </p>
        </div>
      )}

      {/* DOCUMENT VERIFICATION INSPECTION MODAL */}
      {inspectCar && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '750px', width: '90%' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  Compliance & Document Audit
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {inspectCar.brand} {inspectCar.model} ({inspectCar.year})
                </p>
              </div>
              <button
                onClick={() => setInspectCar(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Vehicle Details & Compliance Summary */}
            <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Registration Number</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)', letterSpacing: '1px' }}>
                  {inspectCar.registrationNumber || 'NOT PROVIDED'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Insurance Policy / Expiry</span>
                <strong style={{ fontSize: '0.9rem', color: isDateExpired(inspectCar.insuranceExpiry) ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {inspectCar.insuranceExpiry ? formatDate(inspectCar.insuranceExpiry) : 'No date set'}
                </strong>
                {inspectCar.insurancePolicyNumber && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    #{inspectCar.insurancePolicyNumber}
                  </span>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PUC Expiry Date</span>
                <strong style={{ fontSize: '0.9rem', color: isDateExpired(inspectCar.pucExpiry) ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {inspectCar.pucExpiry ? formatDate(inspectCar.pucExpiry) : 'No date set'}
                </strong>
              </div>
            </div>

            {/* Document Image Previews Grid */}
            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '1.5rem' }}>
              {/* RC Card */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Registration Certificate (RC)
                </span>
                {inspectCar.rcDocUrl ? (
                  <div style={{ position: 'relative', height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', marginBottom: '0.5rem' }}>
                    <img src={inspectCar.rcDocUrl} alt="RC Doc" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <a
                      href={inspectCar.rcDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ExternalLink size={10} /> Full
                    </a>
                  </div>
                ) : (
                  <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No RC uploaded
                  </div>
                )}
              </div>

              {/* Insurance Card */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Insurance Certificate
                </span>
                {inspectCar.insuranceDocUrl ? (
                  <div style={{ position: 'relative', height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', marginBottom: '0.5rem' }}>
                    <img src={inspectCar.insuranceDocUrl} alt="Insurance Doc" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <a
                      href={inspectCar.insuranceDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ExternalLink size={10} /> Full
                    </a>
                  </div>
                ) : (
                  <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No Insurance uploaded
                  </div>
                )}
              </div>

              {/* PUC Card */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  PUC Certificate
                </span>
                {inspectCar.pucDocUrl ? (
                  <div style={{ position: 'relative', height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000', marginBottom: '0.5rem' }}>
                    <img src={inspectCar.pucDocUrl} alt="PUC Doc" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <a
                      href={inspectCar.pucDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <ExternalLink size={10} /> Full
                    </a>
                  </div>
                ) : (
                  <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No PUC uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <StatusBadge status={inspectCar.status} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInspectCar(null);
                    openReasonModal('REJECT', inspectCar.id);
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)' }}
                >
                  <XCircle size={14} />
                  <span>Reject Listing</span>
                </button>

                {inspectCar.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(inspectCar.id)}
                    disabled={actionLoading === inspectCar.id}
                    className="btn btn-success btn-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve & Activate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Reason (Reject or Block) */}
      {modalType && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {modalType === 'REJECT' ? 'Reject Car Listing' : 'Block Car Listing'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Provide an official note to the owner explaining why this listing is being {modalType.toLowerCase()}ed.
            </p>

            {modalType === 'REJECT' && (
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: '1rem' }}>
                {[
                  'Blurry RC document',
                  'Expired insurance policy',
                  'Registration number mismatch',
                  'Incomplete vehicle photos'
                ].map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => setReason(template)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    + {template}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="e.g. Incomplete registration documents, blurry photos, vehicle policy violation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === selectedCarId}
                  className="btn btn-danger"
                >
                  {actionLoading === selectedCarId ? 'Processing...' : `Confirm ${modalType === 'REJECT' ? 'Rejection' : 'Block'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCars;

