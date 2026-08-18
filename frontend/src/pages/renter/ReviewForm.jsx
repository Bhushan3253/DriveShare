import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import bookingService from '../../services/bookingService';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Star, CheckCircle2, ArrowRight, Car, User } from 'lucide-react';

const ReviewForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [carRating, setCarRating] = useState(5);
  const [ownerRating, setOwnerRating] = useState(5);
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkBookingAndReview = async () => {
      try {
        setLoading(true);
        setError('');

        const [bookData, reviewData] = await Promise.all([
          bookingService.getBookingById(bookingId),
          reviewService.getBookingReview(bookingId).catch(() => null)
        ]);

        setBooking(bookData);

        if (reviewData) {
          setExistingReview(reviewData);
        }

        if (bookData?.carId) {
          const carData = await carService.getCarById(bookData.carId);
          setCar(carData);
        }
      } catch (err) {
        console.error('Error loading booking for review:', err);
        setError('Unable to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    checkBookingAndReview();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a short comment about your rental experience.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await reviewService.addReview({
        bookingId,
        carRating,
        ownerRating,
        comment: comment.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('Review submission error:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to submit review.';
      setError(typeof msg === 'string' ? msg : 'Review submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label, icon: Icon }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label className="form-label flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
        <Icon size={16} style={{ color: 'var(--primary)' }} />
        <span>{label}</span>
      </label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              transition: 'transform 150ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Star
              size={28}
              fill={star <= value ? '#FBBF24' : 'transparent'}
              color={star <= value ? '#FBBF24' : 'var(--text-muted)'}
            />
          </button>
        ))}
        <span style={{ marginLeft: '0.75rem', fontWeight: 700, color: '#FBBF24', fontSize: '1rem' }}>
          {value}/5
        </span>
      </div>
    </div>
  );

  if (loading) {
    return <Loading message="Loading booking details..." fullScreen />;
  }

  if (error && !booking) {
    return (
      <div className="container section">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container section flex justify-center items-center">
      <div className="container-sm">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Rate Your Rental Experience
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Your feedback helps the community and supports good car owners.
          </p>

          {car && (
            <div
              className="flex items-center gap-3"
              style={{
                background: 'var(--bg-surface-raised)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem'
              }}
            >
              <img
                src={car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80'}
                alt={car.model}
                style={{ width: '60px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{car.brand} {car.model}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booking #{bookingId?.substring(Math.max(0, bookingId.length - 8))}</p>
              </div>
            </div>
          )}

          {existingReview ? (
            <div className="card" style={{ background: 'var(--bg-surface-raised)', padding: '1.5rem', textAlign: 'center' }}>
              <CheckCircle2 size={36} style={{ color: 'var(--accent-emerald)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Review Already Submitted</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You have already submitted a review for this completed rental.
              </p>
              <Link to="/my-bookings" className="btn btn-secondary">
                Back to Bookings
              </Link>
            </div>
          ) : success ? (
            <div className="card text-center" style={{ background: 'var(--accent-emerald-light)', borderColor: 'rgba(16, 185, 129, 0.3)', padding: '2rem' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--accent-emerald)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#6EE7B7' }}>Thank You for Your Feedback!</h3>
              <p style={{ color: '#A7F3D0', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Your review has been recorded. Redirecting...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <ErrorMessage message={error} />}

              {/* Star Ratings */}
              <StarRating
                value={carRating}
                onChange={setCarRating}
                label="Vehicle Condition & Performance"
                icon={Car}
              />

              <StarRating
                value={ownerRating}
                onChange={setOwnerRating}
                label="Host Communication & Handover"
                icon={User}
              />

              <div className="form-group">
                <label className="form-label">Written Feedback</label>
                <textarea
                  rows={4}
                  required
                  className="form-textarea"
                  placeholder="Share details about car cleanliness, pickup experience, driving comfort..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
                style={{ marginTop: '1.5rem' }}
              >
                {submitting ? (
                  <span>Submitting Review...</span>
                ) : (
                  <>
                    <span>Submit Review</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
