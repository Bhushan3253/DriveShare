import React from 'react';
import { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../../utils/constants';
import { Filter, RotateCcw, Calendar, SlidersHorizontal, IndianRupee } from 'lucide-react';

const RADIUS_OPTIONS = [1, 5, 10, 20, 50];

const MapFilters = ({
  radius = 10,
  onRadiusChange,
  startDate = '',
  endDate = '',
  onStartDateChange,
  onEndDateChange,
  selectedType = '',
  onTypeChange,
  fuelType = '',
  onFuelTypeChange,
  transmission = '',
  onTransmissionChange,
  minPrice = '',
  maxPrice = '',
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  className = ''
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className={`map-filters-panel ${className}`} style={{ width: '100%' }}>
      {/* 1. RADIUS SELECTION CHIPS */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ margin: 0, fontSize: '0.85rem' }}>
            Search Radius: <strong style={{ color: 'var(--primary)' }}>{radius} km</strong>
          </label>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRadiusChange(r)}
              className={`btn btn-sm ${radius === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.3rem 0.75rem',
                fontSize: '0.8rem',
                flex: 1,
                minWidth: '55px',
                textAlign: 'center'
              }}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* 2. DATES */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} style={{ color: 'var(--primary)' }} />
          <span>Rental Dates (Availability)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pickup Date</span>
            <input
              type="date"
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              min={todayStr}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Return Date</span>
            <input
              type="date"
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. CATEGORY CHIPS */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
          Vehicle Type
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['', 'SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric'].map((cat) => (
            <button
              key={cat || 'ALL'}
              type="button"
              onClick={() => onTypeChange(cat)}
              className={`btn btn-sm ${selectedType === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                flexShrink: 0
              }}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. FUEL & TRANSMISSION */}
      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Fuel</label>
          <select
            className="form-select"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            value={fuelType}
            onChange={(e) => onFuelTypeChange(e.target.value)}
          >
            <option value="">All Fuels</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Transmission</label>
          <select
            className="form-select"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            value={transmission}
            onChange={(e) => onTransmissionChange(e.target.value)}
          >
            <option value="">All Transmissions</option>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. PRICE RANGE */}
      <div>
        <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>
          Daily Budget (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            className="form-input"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input
            type="number"
            placeholder="Max ₹"
            className="form-input"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
