import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { createUserLocationIcon, createCarMarkerIcon, createSearchPinIcon } from './mapIcons';
import { formatCurrency } from '../../utils/formatters';
import { formatDistance } from '../../utils/distance';
import { Star, MapPin, ArrowRight, Crosshair } from 'lucide-react';

const DEFAULT_CAR_IMG = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

// Helper component to handle smooth map programmatic movements
const MapController = ({ center, zoom, selectedCar, userLocation, searchLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedCar && selectedCar.latitude && selectedCar.longitude) {
      map.flyTo([selectedCar.latitude, selectedCar.longitude], Math.max(map.getZoom(), 14), {
        duration: 0.8
      });
    }
  }, [selectedCar, map]);

  useEffect(() => {
    if (!selectedCar && center && center[0] && center[1]) {
      map.flyTo(center, zoom || 12, { duration: 1 });
    }
  }, [center, zoom, map]);

  return null;
};

const CarMap = ({
  center = [21.1458, 79.0882], // Default India center (Nagpur)
  zoom = 12,
  userLocation = null,
  searchLocation = null,
  cars = [],
  selectedCar = null,
  onSelectCar = () => {},
  radiusKm = 10,
  showRadiusCircle = true,
  height = '100%',
  className = ''
}) => {
  const mapRef = useRef(null);
  const activeCenter = searchLocation
    ? [searchLocation.latitude, searchLocation.longitude]
    : userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : center;

  const circleCenter = searchLocation
    ? [searchLocation.latitude, searchLocation.longitude]
    : userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : null;

  const handleRecenter = () => {
    if (mapRef.current && activeCenter) {
      mapRef.current.flyTo(activeCenter, zoom || 12, { duration: 1 });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: height }} className={className}>
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <MapController
          center={activeCenter}
          zoom={zoom}
          selectedCar={selectedCar}
          userLocation={userLocation}
          searchLocation={searchLocation}
        />

        {/* Free OpenStreetMap Standard Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="dark-map-tiles"
        />

        {/* Search Radius Circle */}
        {showRadiusCircle && circleCenter && radiusKm && (
          <Circle
            center={circleCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 6'
            }}
          />
        )}

        {/* 1. User Location Marker */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserLocationIcon()}
            zIndexOffset={500}
          >
            <Popup>
              <div style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#60A5FA', fontSize: '0.9rem', marginBottom: '2px' }}>
                  📍 Your Location
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Searching cars within {radiusKm} km
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Searched Location Marker (if distinct from user) */}
        {searchLocation && searchLocation.latitude && searchLocation.longitude && (
          <Marker
            position={[searchLocation.latitude, searchLocation.longitude]}
            icon={createSearchPinIcon(searchLocation.label || 'Search Area')}
            zIndexOffset={400}
          >
            <Popup>
              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF', marginBottom: '2px' }}>
                  🎯 {searchLocation.label || 'Selected Pickup Area'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Active search center
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Nearby Car Markers */}
        {cars.map((car) => {
          if (!car.latitude || !car.longitude) return null;
          const isSelected = selectedCar?.id === car.id;
          const primaryImg =
            car.imageUrl ||
            (car.images && car.images.length > 0 ? car.images[0].url : null) ||
            DEFAULT_CAR_IMG;

          return (
            <Marker
              key={car.id}
              position={[car.latitude, car.longitude]}
              icon={createCarMarkerIcon(car, isSelected)}
              zIndexOffset={isSelected ? 1000 : 100}
              eventHandlers={{
                click: () => onSelectCar(car)
              }}
            >
              <Popup className="car-popup-card">
                <div style={{ width: '260px', overflow: 'hidden' }}>
                  {/* Thumbnail Image */}
                  <div style={{ position: 'relative', width: '100%', height: '130px', background: '#1E293B' }}>
                    <img
                      src={primaryImg}
                      alt={`${car.brand} ${car.model}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_CAR_IMG;
                      }}
                    />
                    {car.distanceKm !== undefined && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(6px)',
                          color: '#38BDF8',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          border: '1px solid rgba(56, 189, 248, 0.3)'
                        }}
                      >
                        {formatDistance(car.distanceKm)}
                      </span>
                    )}
                    {car.verified && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(16, 185, 129, 0.95)',
                          color: '#FFFFFF',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Details Container */}
                  <div style={{ padding: '0.85rem' }}>
                    <div className="flex items-start justify-between gap-1" style={{ marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                        {car.brand} {car.model}
                      </h4>
                      {car.averageRating > 0 && (
                        <div className="flex items-center gap-1" style={{ color: '#FBBF24', fontSize: '0.75rem', fontWeight: 700 }}>
                          <Star size={12} fill="#FBBF24" />
                          <span>{car.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px' }}>
                      <MapPin size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {car.locationName || car.location || 'Pickup Location'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatCurrency(car.pricePerDay)}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> / day</span>
                      </div>

                      <Link
                        to={`/cars/${car.id}`}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <span>View Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Recenter / Locate Button */}
      <button
        onClick={handleRecenter}
        title="Recenter Map"
        className="btn btn-secondary btn-sm flex items-center justify-center"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          padding: 0,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          color: '#38BDF8'
        }}
      >
        <Crosshair size={18} />
      </button>
    </div>
  );
};

export default CarMap;
