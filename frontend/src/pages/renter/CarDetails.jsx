import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import carService from '../../services/carService';
import bookingService from '../../services/bookingService';
import reviewService from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Car,
  Fuel,
  Users,
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [car, setCar] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reservation Date Range Selection
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndDate = new Date();
  defaultEndDate.setDate(new Date().getDate() + 2);
  const defaultEndStr = defaultEndDate.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  // Price Calculation State
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const [carData, availData, reviewData] = await Promise.all([
          carService.getCarById(id),
          carService.getCarAvailability(id).catch(() => []),
          reviewService.getCarReviews(id).catch(() => [])
        ]);

        setCar(carData);
        setAvailabilities(availData || []);
        setReviews(reviewData || []);
      } catch (err) {
        console.error('Error loading car:', err);
        setError('Vehicle details could not be found.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  // Recalculate price whenever dates change
  useEffect(() => {
    const calculateLivePrice = async () => {
      if (!startDate || !endDate || !id) return;
      if (new Date(startDate) > new Date(endDate)) return;

      try {
        setCalcLoading(true);
        const data = await bookingService.calculatePrice(id, startDate, endDate);
        setPriceBreakdown(data);
      } catch (err) {
        console.error('Price calculation error:', err);
      } finally {
        setCalcLoading(false);
      }
    };

    calculateLivePrice();
  }, [id, startDate, endDate]);

  // Check if selected dates are within host availability windows
  const isDateWithinAvailability = () => {
    if (!availabilities || availabilities.length === 0) return true; // If no windows set, owner accepts all
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    return availabilities.some((w) => {
      const wStart = new Date(w.startDate);
      const wEnd = new Date(w.endDate);
      return reqStart >= wStart && reqEnd <= wEnd;
    });
  };

  const isAvailableForSelectedDates = isDateWithinAvailability();

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to reserve this car.');
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.warning('Return date must be on or after pickup date.');
      return;
    }

    try {
      setBookingLoading(true);
      const booking = await bookingService.createBooking({
        carId: id,
        startDate,
        endDate
      });

      toast.success('15-minute reservation hold created!');
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      console.error('Booking hold creation error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to hold booking.';
      toast.error(typeof msg === 'string' ? msg : 'Error creating reservation.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading vehicle specifications & pricing..." fullScreen />;
  }

  if (error || !car) {
    return (
      <div className="container section">
        <ErrorMessage message={error || 'Car not found'} />
      </div>
    );
  }

  const allImages = car.images && car.images.length > 0
    ? car.images.map((img) => img.url)
    : [car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="container section">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
        <Link to="/cars" className="btn btn-secondary btn-sm flex items-center gap-1">
          <ChevronLeft size={16} />
          <span>Back to Search</span>
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={car.status} />
          {car.active && <span className="badge badge-active">Available</span>}
        </div>
      </div>

      <div className="car-details-grid">
        {/* Left Column: Media Gallery & Specs */}
        <div className="flex flex-col gap-6" style={{ minWidth: 0 }}>
          {/* Main Image Gallery */}
          <div className="card card-glass" style={{ padding: '0.75rem', overflow: 'hidden' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                maxHeight: '460px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#0B0F19',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={allImages[activeImageIdx]}
                alt={car.model}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: 'none',
                      color: '#FFF',
                      padding: '8px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: 'none',
                      color: '#FFF',
                      padding: '8px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Row */}
            {allImages.length > 1 && (
              <div className="flex gap-2" style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '84px',
                      height: '56px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: activeImageIdx === idx ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      padding: 0,
                      cursor: 'pointer',
                      background: '#000',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt="thumbnail"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Overview & Specs Card */}
          <div className="card card-glass" style={{ padding: '2rem' }}>
            <div className="flex justify-between items-start flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {car.brand} {car.model}
                </h1>
                <div className="flex items-center gap-2" style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} />
                  <span>{car.location}</span>
                  <span>•</span>
                  <span>Year {car.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-1" style={{ color: '#FBBF24', fontSize: '1.1rem', fontWeight: 700 }}>
                <Star size={18} fill="#FBBF24" />
                <span>{car.averageRating > 0 ? car.averageRating.toFixed(1) : 'New'}</span>
                {car.reviewCount > 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({car.reviewCount} reviews)</span>
                )}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <Car size={20} style={{ margin: '0 auto 0.25rem', color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Type</span>
                <strong style={{ fontSize: '0.9rem' }}>{car.type || 'Sedan'}</strong>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <Fuel size={20} style={{ margin: '0 auto 0.25rem', color: 'var(--accent-emerald)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Fuel</span>
                <strong style={{ fontSize: '0.9rem' }}>{car.fuelType || 'Petrol'}</strong>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <Zap size={20} style={{ margin: '0 auto 0.25rem', color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Transmission</span>
                <strong style={{ fontSize: '0.9rem' }}>{car.transmission || 'Manual'}</strong>
              </div>

              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <Users size={20} style={{ margin: '0 auto 0.25rem', color: 'var(--accent-purple)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Capacity</span>
                <strong style={{ fontSize: '0.9rem' }}>{car.seats || 5} Seats</strong>
              </div>
            </div>

            {/* Verification & Compliance Trust Banner */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '2rem'
              }}
              className="flex items-center justify-between flex-wrap gap-3"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#6EE7B7' }}>
                    Verified Private Host Vehicle
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Registration Certificate (RC) & Active Insurance verified by DriveShare admins.
                  </div>
                </div>
              </div>

              {car.registrationNumber && (
                <div style={{ background: 'var(--bg-surface-raised)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Plate Number</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', color: 'var(--primary)' }}>
                    {car.registrationNumber.length > 6
                      ? `${car.registrationNumber.substring(0, 4)} •••• ${car.registrationNumber.substring(car.registrationNumber.length - 4)}`
                      : car.registrationNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this vehicle</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {car.description || 'Privately owned vehicle maintained in pristine condition. Available for peer-to-peer sharing with verified drivers on DriveShare.'}
              </p>
            </div>

            {/* Host Availability Calendar Windows */}
            {availabilities.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Host Availability Windows
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availabilities.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex items-center gap-1.5"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#6EE7B7',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <Calendar size={14} />
                      <span>{formatDate(avail.startDate)} - {formatDate(avail.endDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="card card-glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Customer Reviews ({reviews.length})
            </h3>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: 'var(--bg-surface-raised)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                      <strong>{r.renterName || 'Verified Driver'}</strong>
                      <div className="flex items-center gap-1" style={{ color: '#FBBF24', fontSize: '0.85rem' }}>
                        <Star size={14} fill="#FBBF24" />
                        <span>{r.carRating}/5</span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No reviews yet for this vehicle. Be the first to rent and leave feedback!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Price Calculator & Instant Reservation Hold */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card card-glass" style={{ padding: '2rem' }}>
            {/* Daily Price */}
            <div className="flex items-baseline gap-1" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatCurrency(car.pricePerDay)}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>/ day</span>
            </div>

            {/* Date Pickers */}
            <div className="flex flex-col gap-3" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Pickup Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Return Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Availability status check */}
            {availabilities.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                {isAvailableForSelectedDates ? (
                  <div className="flex items-center gap-1.5" style={{ color: '#6EE7B7', fontSize: '0.8rem' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Selected dates match host availability</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5" style={{ color: '#FCA5A5', fontSize: '0.8rem' }}>
                    <AlertCircle size={14} style={{ color: 'var(--accent-rose)' }} />
                    <span>Outside host's active availability window</span>
                  </div>
                )}
              </div>
            )}

            {/* Live Pricing Breakdown */}
            {calcLoading ? (
              <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Calculating rate...</span>
              </div>
            ) : priceBreakdown ? (
              <div
                style={{
                  background: 'var(--bg-surface-raised)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <div className="flex justify-between" style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span>{formatCurrency(priceBreakdown.pricePerDay)} × {priceBreakdown.totalDays} days</span>
                  <span>{formatCurrency(priceBreakdown.totalAmount)}</span>
                </div>

                <div className="flex justify-between" style={{ marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <span>Platform Fee & Insurance (15% inc.)</span>
                  <span>{formatCurrency(priceBreakdown.platformCommission)}</span>
                </div>

                <div
                  className="flex justify-between items-center"
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    marginTop: '0.75rem',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}
                >
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>
                    {formatCurrency(priceBreakdown.totalAmount)}
                  </span>
                </div>
              </div>
            ) : null}

            {/* 15-Minute Hold Booking CTA */}
            <button
              onClick={handleBookNow}
              disabled={bookingLoading || !car.active}
              className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
            >
              {bookingLoading ? (
                <span>Reserving 15-min Hold...</span>
              ) : (
                <>
                  <span>Book Now (15-Min Hold)</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5" style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Clock size={13} />
              <span>Reserves vehicle for 15 minutes to complete UPI payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
