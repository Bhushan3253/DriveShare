import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, Loader2 } from 'lucide-react';

const LocationSearch = ({
  onSelectLocation,
  placeholder = 'Search pickup city, station, or landmark...',
  showGpsButton = true,
  onGpsClick,
  isLocating = false,
  initialValue = '',
  className = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || val.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Debounce 450ms to respect OpenStreetMap Nominatim usage policy
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            val.trim()
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'DriveShare-CarRental-App/1.0'
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
          setIsOpen((data && data.length > 0));
        }
      } catch (err) {
        console.warn('Nominatim geocoding request warning:', err);
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const displayName = item.display_name;
    const shortName = item.name || item.address?.city || item.address?.town || item.address?.suburb || displayName.split(',')[0];

    setQuery(displayName);
    setIsOpen(false);
    setSuggestions([]);

    if (onSelectLocation) {
      onSelectLocation({
        latitude: lat,
        longitude: lon,
        displayName: displayName,
        shortName: shortName,
        raw: item
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`location-search-wrapper ${className}`} style={{ position: 'relative', width: '100%' }}>
      <div
        className="flex items-center gap-2"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        <Search size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />

        <input
          type="text"
          className="form-input"
          style={{
            border: 'none',
            background: 'transparent',
            padding: '0.35rem 0',
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            boxShadow: 'none',
            outline: 'none',
            flex: 1
          }}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
        />

        {loading && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}

        {query && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={15} />
          </button>
        )}

        {showGpsButton && onGpsClick && (
          <button
            type="button"
            onClick={onGpsClick}
            disabled={isLocating}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              color: 'var(--accent-cyan)',
              borderColor: 'rgba(6,182,212,0.3)',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0
            }}
            title="Use current GPS location"
          >
            <Navigation size={13} className={isLocating ? 'animate-pulse' : ''} />
            <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="location-suggestions-dropdown animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 1100,
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((item, idx) => (
            <div
              key={item.place_id || idx}
              onClick={() => handleSelect(item)}
              className="flex items-start gap-2.5"
              style={{
                padding: '0.65rem 0.85rem',
                cursor: 'pointer',
                borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                transition: 'background 150ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {item.name || item.display_name.split(',')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.display_name}
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              padding: '4px 8px',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              textAlign: 'right',
              background: 'rgba(0,0,0,0.2)',
              borderTop: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            Powered by OpenStreetMap & Nominatim
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
