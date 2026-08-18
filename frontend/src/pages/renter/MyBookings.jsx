import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Calendar,
  CreditCard,
  CheckCircle,
  Play,
  RotateCcw,
  Star,
  XCircle,
  AlertCircle,
  Car,
  Clock,
  ArrowRight
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [carMap, setCarMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getMyBookings();
      setBookings(data || []);

      // Fetch car details for all unique carIds
      const uniqueCarIds = [...new Set((data || []).map((b) => b.carId).filter(Boolean))];
      const cars = await Promise.all(
        uniqueCarIds.map((cid) => carService.getCarById(cid).catch(() => null))
      );
      const newCarMap = {};
      cars.forEach((c) => {
        if (c && c.id) newCarMap[c.id] = c;
      });
      setCarMap(newCarMap);
    } catch (err) {
      console.error('Error fetching my bookings:', err);
      setError('Unable to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (bookingId) => {
    try {
      await bookingService.checkIn(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed.');
    }
  };

  const handleStartRental = async (bookingId) => {
    try {
      await bookingService.startRental(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start trip.');
    }
  };

  const handleReturnCar = async (bookingId) => {
    try {
      await bookingService.returnCar(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark car returned.');
    }
  };

  const openCancelModal = (bookingId) => {
    setCancelBookingId(bookingId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelBookingId) return;

    try {
      setCancelling(true);
      await bookingService.cancelBooking(cancelBookingId, cancelReason || 'Cancelled by renter');
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancelling(false);
    }
  };

  const handleTabChange = (tab) => {
    setFilter(tab);
    setCurrentPage(1);
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') {
      return ['PAYMENT_PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'RETURNED'].includes(b.status);
    }
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container section">
      {/* Title & Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track reservations, payments, trip statuses, and leave reviews
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2" style={{ background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`btn btn-sm ${filter === tab ? 'btn-primary' : ''}`}
              style={{
                background: filter === tab ? undefined : 'transparent',
                border: 'none',
                padding: '0.4rem 0.85rem'
              }}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchBookings} />}

      {loading ? (
        <Loading message="Loading your rental history..." />
      ) : filteredBookings.length > 0 ? (
        <div>
          <div className="flex flex-col gap-4">
            {paginatedBookings.map((b) => {
              const car = carMap[b.carId];

              return (
                <div
                  key={b.id}
                  className="card card-glass card-hover flex items-start gap-6 flex-wrap md:flex-nowrap"
                  style={{ padding: '1.5rem' }}
                >
                  {/* Car Thumbnail */}
                  <div
                    style={{
                      width: '120px',
                      height: '90px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--bg-surface-raised)'
                    }}
                  >
                    {car?.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={car.model}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted">
                        <Car size={32} />
                      </div>
                    )}
                  </div>

                    {/* Booking Details */}
                    <div className="flex-1" style={{ minWidth: '220px' }}>
                      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                          {car ? `${car.brand} ${car.model}` : 'Vehicle Booking'}
                        </h3>
                        <StatusBadge status={b.status} />
                        {car?.registrationNumber && (
                          <span
                            className="badge badge-purple"
                            style={{ fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 700 }}
                            title="Vehicle Registration Plate"
                          >
                            🚗 {car.registrationNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 flex-wrap" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} style={{ color: 'var(--primary)' }} />
                          {formatDate(b.startDate)} → {formatDate(b.endDate)} ({b.totalDays} {b.totalDays === 1 ? 'day' : 'days'})
                        </span>
                        {car?.location && (
                          <span>📍 {car.location}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 flex-wrap" style={{ fontSize: '0.85rem' }}>
                        <span>
                          Total: <strong style={{ color: 'var(--primary)' }}>{formatCurrency(b.totalAmount || b.totalPrice)}</strong>
                        </span>
                        <span>
                          Payment: <StatusBadge status={b.paymentStatus || 'UNPAID'} />
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Booked: {formatDateTime(b.createdAt)}
                        </span>
                      </div>
                    </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 items-end justify-center" style={{ minWidth: '160px', marginLeft: 'auto' }}>
                    {/* Pay CTA if Payment Pending */}
                    {b.status === 'PAYMENT_PENDING' && (
                      <Link
                        to={`/payment/${b.id}`}
                        className="btn btn-primary btn-sm flex items-center gap-1.5"
                      >
                        <CreditCard size={14} />
                        <span>Submit UPI / UTR</span>
                      </Link>
                    )}

                    {/* Check-In CTA if Confirmed */}
                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCheckIn(b.id)}
                        className="btn btn-success btn-sm flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        <span>Perform Check-In</span>
                      </button>
                    )}

                    {/* Start Trip CTA if Checked In */}
                    {b.status === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleStartRental(b.id)}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                      >
                        <Play size={14} />
                        <span>Start Trip</span>
                      </button>
                    )}

                    {/* Return Car CTA if In Progress */}
                    {b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleReturnCar(b.id)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <RotateCcw size={14} />
                        <span>Return Car</span>
                      </button>
                    )}

                    {/* Leave Review if Completed */}
                    {b.status === 'COMPLETED' && (
                      <Link to={`/reviews/${b.id}`} className="btn btn-primary btn-sm flex items-center gap-1">
                        <Star size={14} />
                        <span>Leave Review</span>
                      </Link>
                    )}

                    {/* Cancel Action if Eligible */}
                    {['PAYMENT_PENDING', 'CONFIRMED'].includes(b.status) && (
                      <button
                        onClick={() => openCancelModal(b.id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
          <Car size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bookings found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You haven't made any car reservations matching this filter.
          </p>
          <Link to="/cars" className="btn btn-primary">
            Explore Cars to Rent
          </Link>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Cancel Reservation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel this booking? This will release the vehicle hold.
            </p>

            <form onSubmit={handleCancelBooking}>
              <div className="form-group">
                <label className="form-label">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="e.g. Plans changed, found another car..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="btn btn-danger"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
