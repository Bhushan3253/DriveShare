import React, { useState, useEffect } from 'react';
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
  Star
} from 'lucide-react';

const AdminCars = () => {
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
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (carId) => {
    try {
      setActionLoading(carId);
      const updated = await carService.unblockCar(carId);
      setCars(cars.map((c) => (c.id === carId ? updated : c)));
    } catch (err) {
      alert(err.response?.data?.message || 'Unblock failed.');
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
      } else if (modalType === 'BLOCK') {
        updated = await carService.blockCar(selectedCarId, reason);
      }

      setCars(cars.map((c) => (c.id === selectedCarId ? updated : c)));
      setModalType(null);
    } catch (err) {
      alert(err.response?.data?.message || `${modalType} action failed.`);
    } finally {
      setActionLoading(null);
    }
  };

  const paginatedCars = cars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fleet Moderation & Approvals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review host vehicle submissions, approve active listings, and manage policy blocks
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
                  <th>Vehicle</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCars.map((car) => {
                  return (
                    <tr key={car.id}>
                      {/* Vehicle Column */}
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
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {car.year} • {car.fuelType} • {car.transmission} • {car.seats} Seats
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

                      {/* Category */}
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {car.type}
                        </span>
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

      {/* Modal for Reason (Reject or Block) */}
      {modalType && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {modalType === 'REJECT' ? 'Reject Car Listing' : 'Block Car Listing'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Provide an official note to the owner explaining why this listing is being {modalType.toLowerCase()}ed.
            </p>

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
