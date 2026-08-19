import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { Star, RefreshCw, MessageSquare, Car, User } from 'lucide-react';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reviewService.getAllReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      setError('Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Reviews & Moderation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Customer feedback for vehicle condition and host communication
          </p>
        </div>

        <button onClick={fetchReviews} className="btn btn-secondary btn-sm flex items-center gap-1">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchReviews} />}

      {loading ? (
        <Loading message="Loading customer reviews..." />
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="card card-glass flex flex-col justify-between"
              style={{ background: 'var(--bg-surface)', padding: '1.5rem' }}
            >
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {r.renterName?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{r.renterName || 'Verified Renter'}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Booking #{r.bookingId?.substring(Math.max(0, r.bookingId.length - 8))}
                      </p>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(r.createdAt)}
                  </span>
                </div>

                {/* Ratings */}
                <div className="flex items-center gap-4" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-1" style={{ color: '#FBBF24', fontSize: '0.85rem', fontWeight: 700 }}>
                    <Car size={14} style={{ color: 'var(--primary)' }} />
                    <span>Car:</span>
                    <Star size={13} fill="#FBBF24" />
                    <span>{r.carRating}/5</span>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: '#FBBF24', fontSize: '0.85rem', fontWeight: 700 }}>
                    <User size={14} style={{ color: 'var(--accent-purple)' }} />
                    <span>Host:</span>
                    <Star size={13} fill="#FBBF24" />
                    <span>{r.ownerRating}/5</span>
                  </div>
                </div>

                {/* Comment */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, background: 'var(--bg-surface-raised)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  "{r.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No reviews submitted yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Customer ratings and comments will appear here once trips are completed.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
