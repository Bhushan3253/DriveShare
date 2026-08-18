import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  CalendarCheck,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';

const AdminBookings = () => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Force Cancel Modal
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getAllBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching admin bookings:', err);
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleForceCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking || !cancelReason) return;

    try {
      setActionLoading(cancelModalBooking.id);
      const updated = await bookingService.forceCancelBooking(cancelModalBooking.id, cancelReason);
      setBookings(bookings.map((b) => (b.id === cancelModalBooking.id ? updated : b)));
      setCancelModalBooking(null);
      toast.warning('Booking force-cancelled and car released.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Force cancellation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    if (!filteredBookings.length) {
      toast.warning('No bookings to export.');
      return;
    }

    const headers = ['Booking ID', 'Car ID', 'Renter ID', 'Start Date', 'End Date', 'Total Amount', 'Status', 'Payment Status', 'Created At'];
    const rows = filteredBookings.map((b) => [
      `"${b.id}"`,
      `"${b.carId || ''}"`,
      `"${b.renterId || ''}"`,
      `"${b.startDate || ''}"`,
      `"${b.endDate || ''}"`,
      b.totalAmount || b.totalPrice || 0,
      `"${b.status || ''}"`,
      `"${b.paymentStatus || ''}"`,
      `"${b.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DriveShare_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bookings exported to CSV!');
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.id?.toLowerCase().includes(term) ||
      b.renterId?.toLowerCase().includes(term) ||
      b.carId?.toLowerCase().includes(term)
    );
  });

  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform Bookings & Overrides</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            All reservations across the platform with full status lifecycle and dispute management
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            className="form-input"
            style={{ width: '220px', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            placeholder="Search booking, user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button onClick={exportToCSV} className="btn btn-secondary btn-sm flex items-center gap-1.5" title="Export CSV">
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button onClick={fetchBookings} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        {['ALL', 'PAYMENT_PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'RETURNED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleStatusFilterChange(tab)}
            className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchBookings} />}

      {loading ? (
        <Loading message="Loading platform bookings..." />
      ) : filteredBookings.length > 0 ? (
        <div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Car ID</th>
                  <th>Renter</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b) => {
                  const canCancel = b.status !== 'COMPLETED' && b.status !== 'CANCELLED';

                  return (
                    <tr key={b.id}>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          #{b.id.substring(Math.max(0, b.id.length - 8))}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          #{b.carId?.substring(Math.max(0, b.carId.length - 6))}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          #{b.renterId?.substring(Math.max(0, b.renterId.length - 6))}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1" style={{ fontSize: '0.85rem' }}>
                          <Calendar size={13} style={{ color: 'var(--primary)' }} />
                          <span>{formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {formatCurrency(b.totalAmount || b.totalPrice)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={b.paymentStatus} />
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={b.status} />
                          {b.cancellationReason && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-rose)' }}>
                              {b.cancellationReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDate(b.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end">
                          {canCancel && (
                            <button
                              onClick={() => {
                                setCancelModalBooking(b);
                                setCancelReason('');
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              title="Force Cancel Reservation"
                            >
                              <XCircle size={13} />
                              <span style={{ marginLeft: '4px' }}>Cancel</span>
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
            totalItems={filteredBookings.length}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <CalendarCheck size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bookings found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No bookings match the selected filter.
          </p>
        </div>
      )}

      {/* FORCE CANCEL OVERRIDE MODAL */}
      {cancelModalBooking && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content">
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} style={{ color: 'var(--accent-rose)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Admin Cancellation Override</h3>
              </div>
              <button
                onClick={() => setCancelModalBooking(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              This will immediately cancel Booking #{cancelModalBooking.id.substring(Math.max(0, cancelModalBooking.id.length - 8))}, release the vehicle hold, and notify both parties.
            </p>

            <form onSubmit={handleForceCancel}>
              <div className="form-group">
                <label className="form-label">Official Cancellation Reason *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="e.g. Vehicle breakdown prior to handover, host no-show dispute, renter safety cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="btn btn-secondary"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === cancelModalBooking.id}
                  className="btn btn-danger"
                >
                  {actionLoading === cancelModalBooking.id ? 'Processing...' : 'Confirm Force Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

