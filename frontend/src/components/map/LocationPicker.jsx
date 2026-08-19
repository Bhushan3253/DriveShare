import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import LocationSearch from './LocationSearch';
import { getUserCurrentPosition } from '../../utils/distance';
import { MapPin, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';

const pickerIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: grab;">
      <div style="background: #2563EB; color: #FFFFFF; padding: 4px 8px; border-radius: 12px; font-weight: 700; font-size: 0.72rem; box-shadow: 0 4px 12px rgba(37,99,235,0.5); display: flex; align-items: center; gap: 4px;">
        <span>🚗</span>
        <span>Pickup Spot</span>
      </div>
      <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #2563EB;"></div>
    </div>
  `,
  iconSize: [85, 36],
  iconAnchor: [42, 34]
});

// Map click handler to place/move pin
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Map center synchronizer
const CenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 0.8 });
    }
  }, [center, map]);
  return null;
};

const LocationPicker = ({
  latitude,
  longitude,
  locationName = '',
  onChange,
  required = false
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMap, setShowMap] = useState(false);

  const hasCoords = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined && latitude !== '' && longitude !== '';
  const currentCenter = hasCoords ? [Number(latitude), Number(longitude)] : [21.1458, 79.0882];

  // Reverse geocode to get human address from lat/lon
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'DriveShare-CarRental-App/1.0'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
    } catch (err) {
      console.warn('Reverse geocode warning:', err);
    }
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  };

  const handleCoordsUpdate = async (lat, lon, newLocName = '') => {
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setErrorMsg('Invalid coordinates: Latitude [-90, 90], Longitude [-180, 180].');
      return;
    }
    setErrorMsg('');

    let name = newLocName || locationName;
    if (!name || name.startsWith('GPS:')) {
      const fetchedName = await reverseGeocode(lat, lon);
      if (fetchedName) name = fetchedName;
    }

    if (onChange) {
      onChange({
        latitude: lat,
        longitude: lon,
        locationName: name
      });
    }
  };

  // Option A: Use GPS
  const handleUseGps = async () => {
    setIsLocating(true);
    setErrorMsg('');
    try {
      const pos = await getUserCurrentPosition();
      const addr = await reverseGeocode(pos.latitude, pos.longitude);
      handleCoordsUpdate(pos.latitude, pos.longitude, addr);
      setShowMap(true);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to retrieve current location.');
    } finally {
      setIsLocating(false);
    }
  };

  // Option B: Search Result Selected
  const handleSearchSelect = (item) => {
    handleCoordsUpdate(item.latitude, item.longitude, item.displayName);
    setShowMap(true);
  };

  return (
    <div className="location-picker-card" style={{ width: '100%' }}>
      {/* Search and GPS Trigger */}
      <div className="flex flex-col gap-2" style={{ marginBottom: '0.75rem' }}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="form-label" style={{ margin: 0, fontSize: '0.88rem' }}>
            Pickup Area & GPS Coordinates {required && '*'}
          </label>

          <button
            type="button"
            onClick={handleUseGps}
            disabled={isLocating}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              borderColor: 'rgba(6,182,212,0.3)'
            }}
          >
            <Navigation size={13} className={isLocating ? 'animate-pulse' : ''} />
            <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
          </button>
        </div>

        <LocationSearch
          onSelectLocation={handleSearchSelect}
          placeholder="Search pickup address or landmark (e.g. Bandra West, Mumbai)..."
          showGpsButton={false}
          initialValue={locationName}
        />
      </div>

      {errorMsg && (
        <div
          className="flex items-center gap-1.5"
          style={{
            color: '#FCA5A5',
            fontSize: '0.78rem',
            marginBottom: '0.5rem'
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Coordinate Badges & Map Toggle */}
      <div
        className="flex items-center justify-between flex-wrap gap-2"
        style={{
          background: 'var(--bg-surface-raised)',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '0.75rem'
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {hasCoords ? (
            <>
              <div className="flex items-center gap-1" style={{ color: '#10B981', fontSize: '0.78rem', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                <span>Coordinates Set:</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#60A5FA', background: 'rgba(59,130,246,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              No GPS coordinates set yet. Search address or click "Use Location" to enable map discovery.
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
        >
          {showMap ? 'Hide Map Picker' : 'Open Map Pin Picker'}
        </button>
      </div>

      {/* Interactive Map Picker (Option C) */}
      {showMap && (
        <div
          className="animate-fade-in"
          style={{
            height: '240px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-strong)',
            position: 'relative',
            marginTop: '0.5rem'
          }}
        >
          <MapContainer
            center={currentCenter}
            zoom={hasCoords ? 14 : 11}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={false}
          >
            <CenterMap center={currentCenter} />
            <MapClickHandler onLocationSelect={(lat, lng) => handleCoordsUpdate(lat, lng)} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="dark-map-tiles"
            />

            {hasCoords && (
              <Marker
                position={[Number(latitude), Number(longitude)]}
                icon={pickerIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    handleCoordsUpdate(position.lat, position.lng);
                  }
                }}
              />
            )}
          </MapContainer>
          <div
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '6px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(4px)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            💡 Click anywhere or drag the pin to adjust the exact car pickup spot
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
