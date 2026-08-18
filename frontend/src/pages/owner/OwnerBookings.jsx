import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Calendar,
  CheckCircle,
  Play,
  RotateCcw,
  CheckCheck,
  XCircle,
  Clock,
  Car
} from 'lucide-react';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [carMap, setCarMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getOwnerBookings();
      setBookings(data || []);

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
      console.error('Error fetching owner bookings:', err);
      setError('Unable to load bookings for your cars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const handleAction = async (bookingId, actionFunc) => {
    try {
      setActionLoading(bookingId);
      await actionFunc(bookingId);
      fetchOwnerBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const paginatedBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container section">
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Fleet Bookings & Rentals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage renter reservations, handovers, returns, and complete trips to trigger earnings payout
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOwnerBookings} />}

      {loading ? (
        <Loading message="Loading fleet bookings..." />
      ) : bookings.length > 0 ? (
        <div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Trip Dates</th>
                  <th>Gross Total</th>
                  <th>Your Payout (85%)</th>
                  <th>Payment</th>
                  <th>Trip Status</th>
                  <th style={{ textAlign: 'right' }}>Handover Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b) => {
                  const car = carMap[b.carId];
                  const ownerShare = (b.totalPrice || b.totalAmount) * 0.85;

                  return (
                    <tr key={b.id}>
                      {/* Vehicle */}
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
                            {car?.imageUrl ? (
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
                              {car ? `${car.brand} ${car.model}` : 'Vehicle'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Booking #{b.id.substring(Math.max(0, b.id.length - 8))}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td>
                        <div className="flex items-center gap-1" style={{ fontSize: '0.85rem' }}>
                          <Calendar size={13} style={{ color: 'var(--primary)' }} />
                          <span>{formatDate(b.startDate)} → {formatDate(b.endDate)}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {b.totalDays} {b.totalDays === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      {/* Gross Price */}
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatCurrency(b.totalPrice || b.totalAmount)}
                        </span>
                      </td>

                      {/* Owner Share (85%) */}
                      <td>
                        <strong style={{ color: 'var(--accent-emerald)', fontSize: '1rem' }}>
                          {formatCurrency(ownerShare)}
                        </strong>
                      </td>

                      {/* Payment Status */}
                      <td>
                        <StatusBadge status={b.paymentStatus || 'UNPAID'} />
                      </td>

                      {/* Trip Status */}
                      <td>
                        <StatusBadge status={b.status} />
                      </td>

                      {/* Handover & Trip Completion CTA */}
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {/* Check-In Handover */}
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleAction(b.id, bookingService.checkIn)}
                              disabled={actionLoading === b.id}
                              className="btn btn-success btn-sm flex items-center gap-1"
                            >
                              <CheckCircle size={14} />
                              <span>Check-In</span>
                            </button>
                          )}

                          {/* Start Rental */}
                          {b.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleAction(b.id, bookingService.startRental)}
                              disabled={actionLoading === b.id}
                              className="btn btn-primary btn-sm flex items-center gap-1"
                            >
                              <Play size={14} />
                              <span>Start Trip</span>
                            </button>
                          )}

                          {/* Return Car Handover */}
                          {b.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleAction(b.id, bookingService.returnCar)}
                              disabled={actionLoading === b.id}
                              className="btn btn-secondary btn-sm flex items-center gap-1"
                            >
                              <RotateCcw size={14} />
                              <span>Receive Return</span>
                            </button>
                          )}

                          {/* Complete & Trigger Payout */}
                          {b.status === 'RETURNED' && (
                            <button
                              onClick={() => handleAction(b.id, bookingService.completeBooking)}
                              disabled={actionLoading === b.id}
                              className="btn btn-primary btn-sm flex items-center gap-1"
                              title="Complete trip and generate payout"
                            >
                              <CheckCheck size={14} />
                              <span>Complete & Finalize</span>
                            </button>
                          )}

                          {b.status === 'COMPLETED' && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                              Trip Finalized
                            </span>
                          )}

                          {b.status === 'PAYMENT_PENDING' && (
                            <span style={{ fontSize: '0.8rem', color: '#FBBF24' }}>
                              Awaiting Payment
                            </span>
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
            totalItems={bookings.length}
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
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No bookings received yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Bookings made by renters for your cars will show up here.
          </p>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
