import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { Calendar, MapPin, ShieldCheck, ArrowRight, Clock, AlertCircle } from 'lucide-react';

const Booking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
        if (data.carId) {
          const carData = await carService.getCarById(data.carId);
          setCar(carData);
        }
      } catch (err) {
        console.error('Error loading booking:', err);
        setError('Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <Loading message="Loading booking confirmation..." fullScreen />;
  }

  if (error || !booking) {
    return (
      <div className="container section">
        <ErrorMessage message={error || 'Booking not found'} />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="container-md">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Booking ID: #{booking.id.substring(Math.max(0, booking.id.length - 8))}
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>Reservation Details</h1>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* Vehicle summary */}
          {car && (
            <div
              className="flex items-center gap-4"
              style={{
                background: 'var(--bg-surface-raised)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}
            >
              <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                alt={car.model}
                style={{ width: '90px', height: '65px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
              <div className="flex-1">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{car.brand} {car.model} ({car.year})</h3>
                <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} />
                  <span>{car.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Date & Price Breakdown */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup Date</span>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem' }}>{formatDate(booking.startDate)}</p>
            </div>
            <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Return Date</span>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem' }}>{formatDate(booking.endDate)}</p>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {formatCurrency(booking.pricePerDay)} × {booking.totalDays} days
              </span>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontWeight: 800, fontSize: '1.25rem' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary)' }}>{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>

          {/* Action to proceed to payment */}
          {booking.paymentStatus === 'PENDING' && (
            <Link
              to={`/payment/${booking.id}`}
              className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
            >
              <span>Proceed to UPI Payment</span>
              <ArrowRight size={18} />
            </Link>
          )}

          {booking.paymentStatus === 'PAID' && (
            <Link to="/my-bookings" className="btn btn-secondary btn-block">
              View In My Bookings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
