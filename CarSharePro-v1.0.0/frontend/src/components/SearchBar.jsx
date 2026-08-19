import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Car as CarIcon, ArrowRight } from 'lucide-react';
import { CAR_TYPES } from '../utils/constants';

const SearchBar = ({ initialParams = {}, onSearch, isCompact = false }) => {
  const navigate = useNavigate();

  const [location, setLocation] = useState(initialParams.location || '');
  const [startDate, setStartDate] = useState(initialParams.startDate || '');
  const [endDate, setEndDate] = useState(initialParams.endDate || '');
  const [type, setType] = useState(initialParams.type || '');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);

    if (onSearch) {
      onSearch({ location, startDate, endDate, type });
    } else {
      navigate(`/cars?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`card card-glass ${isCompact ? 'p-3' : 'p-6'}`}
      style={{
        width: '100%',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-strong)'
      }}
    >
      <div className="grid grid-cols-4 gap-4 items-end">
        {/* Location */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label flex items-center gap-1">
            <MapPin size={14} style={{ color: 'var(--primary)' }} />
            Location / City
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Mumbai, Pune, Delhi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Start Date */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label flex items-center gap-1">
            <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
            Pickup Date
          </label>
          <input
            type="date"
            className="form-input"
            min={todayStr}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate(e.target.value);
              }
            }}
          />
        </div>

        {/* End Date */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label flex items-center gap-1">
            <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
            Return Date
          </label>
          <input
            type="date"
            className="form-input"
            min={startDate || todayStr}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Search CTA */}
        <div className="form-group flex justify-end" style={{ margin: 0 }}>
          <button
            type="submit"
            className="btn btn-primary btn-block flex items-center justify-center gap-2"
            style={{ height: '45px' }}
          >
            <Search size={18} />
            <span>Search Cars</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
