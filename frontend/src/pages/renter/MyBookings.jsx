import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import carService from '../../services/carService';
import { useToast } from '../../context/ToastContext';
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
  ArrowRight,
  ClipboardCheck,
  Fuel,
  Gauge,
  Camera,
  Upload,
  X,
  FileText
} from 'lucide-react';

const MyBookings = () => {
  const toast = useToast();
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

  // Pre-Trip / Post-Trip Inspection Modal State
  const [inspectionModalMode, setInspectionModalMode] = useState(null); // 'CHECK_IN' or 'RETURN'
  const [selectedInspectionBooking, setSelectedInspectionBooking] = useState(null);
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState('100%');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Inspection Report View Modal
  const [reportBooking, setReportBooking] = useState(null);

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

  const openCheckInModal = (booking) => {
    setSelectedInspectionBooking(booking);
    setInspectionModalMode('CHECK_IN');
    setOdometer('');
    setFuelLevel('100%');
    setInspectionNotes('');
  };

  const openReturnModal = (booking) => {
    setSelectedInspectionBooking(booking);
    setInspectionModalMode('RETURN');
    setOdometer(booking.startOdometer ? String(booking.startOdometer + 50) : '');
    setFuelLevel(booking.startFuelLevel || '100%');
    setInspectionNotes('');
  };

  const handleInspectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInspectionBooking) return;

    try {
      setSubmittingInspection(true);
      const odoVal = odometer ? parseInt(odometer, 10) : null;

      if (inspectionModalMode === 'CHECK_IN') {
        await bookingService.checkIn(selectedInspectionBooking.id, {
          odometer: odoVal,
          fuelLevel,
          notes: inspectionNotes
        });
        toast.success('Pre-trip check-in inspection recorded!');
      } else if (inspectionModalMode === 'RETURN') {
        await bookingService.returnCar(selectedInspectionBooking.id, {
          odometer: odoVal,
          fuelLevel,
          notes: inspectionNotes
        });
        toast.success('Return inspection recorded & car returned!');
      }

      setInspectionModalMode(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Inspection failed.');
    } finally {
      setSubmittingInspection(false);
    }
  };

  const handleStartRental = async (bookingId) => {
    try {
      await bookingService.startRental(bookingId);
      toast.success('Trip started! Drive safe.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start trip.');
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
      toast.warning('Reservation has been cancelled.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Bookings & Trips</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track reservations, complete vehicle handover inspections, and view trip reports
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2" style={{ background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchBookings} />}

      {loading ? (
        <Loading message="Loading your reservations and handover inspections..." />
      ) : filteredBookings.length > 0 ? (
        <div>
          <div className="flex flex-col gap-4">
            {paginatedBookings.map((b) => {
              const car = carMap[b.carId];
              const primaryImg = car?.imageUrl || (car?.images && car.images[0]?.url);
              const hasInspection = !!b.startOdometer;

              return (
                <div
                  key={b.id}
                  className="card card-glass flex items-center justify-between flex-wrap gap-4"
                  style={{ padding: '1.5rem' }}
                >
                  {/* Car Thumbnail */}
                  <div
                    style={{
                      width: '100px',
                      height: '75px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: 'var(--bg-surface-raised)',
                      flexShrink: 0
                    }}
                  >
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt="Vehicle"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted">
                        <Car size={24} />
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
                      {b.startOdometer && (
                        <span style={{ color: 'var(--accent-cyan)' }}>
                          📟 Start: {b.startOdometer} km
                        </span>
                      )}
                      {b.totalDistanceDriven && (
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          🚀 Driven: {b.totalDistanceDriven} km
                        </span>
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
                  <div className="flex flex-col gap-2 items-end justify-center" style={{ minWidth: '170px', marginLeft: 'auto' }}>
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

                    {/* Check-In CTA if Confirmed (opens inspection modal) */}
                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => openCheckInModal(b)}
                        className="btn btn-success btn-sm flex items-center gap-1"
                      >
                        <ClipboardCheck size={14} />
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

                    {/* Return Car CTA if In Progress (opens return inspection modal) */}
                    {b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => openReturnModal(b)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <RotateCcw size={14} />
                        <span>Return Car</span>
                      </button>
                    )}

                    {/* View Handover Inspection Report */}
                    {hasInspection && (
                      <button
                        onClick={() => setReportBooking(b)}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        <FileText size={12} />
                        <span>Inspection Report</span>
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

      {/* TRIP HANDOVER & VEHICLE INSPECTION MODAL */}
      {inspectionModalMode && selectedInspectionBooking && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {inspectionModalMode === 'CHECK_IN' ? 'Pre-Trip Handover Inspection' : 'Post-Trip Return Inspection'}
                </h3>
              </div>
              <button
                onClick={() => setInspectionModalMode(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {inspectionModalMode === 'CHECK_IN'
                ? 'Record vehicle condition and starting odometer with the host before taking the keys.'
                : 'Record final odometer reading and return fuel level to complete your rental handover.'}
            </p>

            <form onSubmit={handleInspectionSubmit}>
              <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
                {/* Odometer */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label flex items-center gap-1">
                    <Gauge size={13} style={{ color: 'var(--accent-cyan)' }} />
                    <span>{inspectionModalMode === 'CHECK_IN' ? 'Starting Odometer (KM) *' : 'Return Odometer (KM) *'}</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="e.g. 24500"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                  />
                  {inspectionModalMode === 'RETURN' && selectedInspectionBooking.startOdometer && odometer && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '2px', display: 'block' }}>
                      Driven: {Math.max(0, parseInt(odometer, 10) - selectedInspectionBooking.startOdometer)} KM
                    </span>
                  )}
                </div>

                {/* Fuel Level */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label flex items-center gap-1">
                    <Fuel size={13} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Fuel Level (%)</span>
                  </label>
                  <select
                    className="form-select"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                  >
                    <option value="100%">100% (Full Tank)</option>
                    <option value="75%">75% (3/4 Tank)</option>
                    <option value="50%">50% (Half Tank)</option>
                    <option value="25%">25% (Quarter Tank)</option>
                    <option value="Empty">Near Empty</option>
                  </select>
                </div>
              </div>

              {/* Inspection Notes */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Pre-existing Scratches / Notes</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="e.g. Small scratch on rear bumper, spare tire present, pristine interior..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInspectionModalMode(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className="btn btn-primary flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  <span>{submittingInspection ? 'Submitting...' : `Confirm & Save ${inspectionModalMode === 'CHECK_IN' ? 'Check-In' : 'Return'}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECTION REPORT VIEWER MODAL */}
      {reportBooking && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '550px', width: '90%' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Vehicle Handover Report</h3>
              </div>
              <button
                onClick={() => setReportBooking(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              {/* Start Handover */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                  🏁 Check-In Handover
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Odometer: <strong>{reportBooking.startOdometer ? `${reportBooking.startOdometer} km` : 'Not recorded'}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Fuel Level: <strong>{reportBooking.startFuelLevel || '100%'}</strong>
                </p>
                {reportBooking.checkInNotes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Note: "{reportBooking.checkInNotes}"
                  </p>
                )}
              </div>

              {/* Return Handover */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', display: 'block', marginBottom: '0.5rem' }}>
                  🏁 Return Handover
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Odometer: <strong>{reportBooking.endOdometer ? `${reportBooking.endOdometer} km` : 'Pending return'}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Fuel Level: <strong>{reportBooking.endFuelLevel || '-'}</strong>
                </p>
                {reportBooking.totalDistanceDriven && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, marginTop: '0.25rem' }}>
                    Total Driven: {reportBooking.totalDistanceDriven} km
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setReportBooking(null)} className="btn btn-secondary btn-sm">
                Close Report
              </button>
            </div>
          </div>
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
