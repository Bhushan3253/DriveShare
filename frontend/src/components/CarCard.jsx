import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Fuel, Gauge, Users, MapPin, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_CAR_IMG = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

const CarCard = ({ car }) => {
  if (!car) return null;

  // Determine primary or first available image
  const primaryImg =
    car.imageUrl ||
    (car.images && car.images.length > 0 ? car.images[0].url : null) ||
    DEFAULT_CAR_IMG;

  const rating = car.averageRating || 0;
  const reviewCount = car.reviewCount || 0;

  return (
    <div className="card card-hover flex flex-col" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Image & Badges */}
      <div style={{ position: 'relative', width: '100%', height: '200px', background: 'var(--bg-surface-raised)' }}>
        <img
          src={primaryImg}
          alt={`${car.brand} ${car.model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_CAR_IMG;
          }}
        />
        {/* Type / Year Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>{car.year} • {car.type || 'Sedan'}</span>
        </div>

        {/* Verified Badge */}
        {car.rcDocUrl && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(16, 185, 129, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#FFFFFF'
            }}
          >
            ✓ Verified
          </div>
        )}

        {/* Location & Masked Plate Badge */}
        <div
          className="flex items-center gap-1.5"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(17, 24, 39, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <MapPin size={12} style={{ color: 'var(--primary)' }} />
          <span>{car.location || 'City'}</span>
          {car.distanceKm !== undefined && (
            <>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ color: '#38BDF8', fontWeight: 700 }}>
                {car.distanceKm < 1 ? `${Math.round(car.distanceKm * 1000)} m` : `${car.distanceKm.toFixed(1)} km`}
              </span>
            </>
          )}
          {car.registrationNumber && (
            <>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ letterSpacing: '0.5px', color: 'var(--accent-cyan)' }}>
                {car.registrationNumber.length > 6
                  ? `${car.registrationNumber.substring(0, 4)} •••• ${car.registrationNumber.substring(car.registrationNumber.length - 4)}`
                  : car.registrationNumber}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              {car.brand} {car.model}
            </h3>
          </div>
          <div
            className="flex items-center gap-1"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: '#FBBF24',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <Star size={13} fill="#FBBF24" />
            <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
            {reviewCount > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Specs Badges */}
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '1.25rem' }}>
          {car.fuelType && (
            <span
              className="flex items-center gap-1"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface-raised)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Fuel size={12} style={{ color: 'var(--accent-cyan)' }} />
              {car.fuelType}
            </span>
          )}
          {car.transmission && (
            <span
              className="flex items-center gap-1"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface-raised)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Gauge size={12} style={{ color: 'var(--accent-purple)' }} />
              {car.transmission}
            </span>
          )}
          {car.seats && (
            <span
              className="flex items-center gap-1"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-surface-raised)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Users size={12} style={{ color: 'var(--accent-emerald)' }} />
              {car.seats} Seats
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div
          className="flex items-center justify-between"
          style={{
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(car.pricePerDay)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / day</span>
          </div>

          <Link to={`/cars/${car.id}`} className="btn btn-primary btn-sm flex items-center gap-1">
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
