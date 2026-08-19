import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import carService from '../../services/carService';
import CarMap from '../../components/map/CarMap';
import LocationSearch from '../../components/map/LocationSearch';
import MapFilters from '../../components/map/MapFilters';
import CarCard from '../../components/CarCard';
import SkeletonCard from '../../components/SkeletonCard';
import ErrorMessage from '../../components/ErrorMessage';
import { getUserCurrentPosition, formatDistance } from '../../utils/distance';
import { formatCurrency } from '../../utils/formatters';
import {
  Compass,
  Map as MapIcon,
  Grid,
  List,
  SlidersHorizontal,
  Navigation,
  AlertCircle,
  RotateCcw,
  Star,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Gauge,
  Users
} from 'lucide-react';

const DEFAULT_CAR_IMG = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

const NearbyCars = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Location & Geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Cars & UI state
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [viewMode, setViewMode] = useState('SPLIT'); // 'SPLIT' | 'MAP' | 'LIST'
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filters
  const [radius, setRadius] = useState(Number(searchParams.get('radius')) || 10);
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const carCardRefs = useRef({});

  // 1. Initial Geolocation on mount
  useEffect(() => {
    const initLocation = async () => {
      setIsLocating(true);
      setLocationError('');
      try {
        const pos = await getUserCurrentPosition();
        setUserLocation({
          latitude: pos.latitude,
          longitude: pos.longitude
        });
      } catch (err) {
        console.warn('Geolocation warning:', err.message);
        setLocationError(
          'Location permission denied. Please allow GPS access or search your city above.'
        );
        // Default to Nagpur (Central India) coordinates as fallback center
        setUserLocation({
          latitude: 21.1458,
          longitude: 79.0882
        });
      } finally {
        setIsLocating(false);
      }
    };

    initLocation();
  }, []);

  // 2. Fetch Nearby Cars whenever active coordinates, radius, dates, or filters change
  const fetchNearbyCars = async () => {
    const activeLat = searchLocation ? searchLocation.latitude : userLocation?.latitude;
    const activeLon = searchLocation ? searchLocation.longitude : userLocation?.longitude;

    if (!activeLat || !activeLon) return;

    try {
      setLoading(true);
      setError('');

      const params = {
        latitude: activeLat,
        longitude: activeLon,
        radius: radius
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (type) params.type = type;
      if (fuelType) params.fuelType = fuelType;
      if (transmission) params.transmission = transmission;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await carService.getNearbyCars(params);
      setCars(data || []);
      if (data && data.length > 0) {
        setSelectedCar(data[0]);
      } else {
        setSelectedCar(null);
      }
    } catch (err) {
      console.error('Error discovering nearby cars:', err);
      setError('Unable to load nearby vehicles. Please try again or search a different area.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation || searchLocation) {
      fetchNearbyCars();
    }
  }, [
    userLocation?.latitude,
    userLocation?.longitude,
    searchLocation?.latitude,
    searchLocation?.longitude,
    radius,
    startDate,
    endDate,
    type,
    fuelType,
    transmission,
    minPrice,
    maxPrice
  ]);

  // Handle GPS Locate Me button
  const handleGpsLocate = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const pos = await getUserCurrentPosition();
      setUserLocation({
        latitude: pos.latitude,
        longitude: pos.longitude
      });
      setSearchLocation(null);
    } catch (err) {
      setLocationError(err.message || 'Unable to retrieve GPS coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  // Handle Nominatim Location Select
  const handleSelectLocation = (loc) => {
    setSearchLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      label: loc.shortName
    });
    setLocationError('');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setRadius(10);
    setStartDate('');
    setEndDate('');
    setType('');
    setFuelType('');
    setTransmission('');
    setMinPrice('');
    setMaxPrice('');
    setSearchLocation(null);
  };

  // Select Car & Scroll Card into View
  const handleCarSelect = (car) => {
    setSelectedCar(car);
    if (carCardRefs.current[car.id]) {
      carCardRefs.current[car.id].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  };

  const activeCenter = searchLocation
    ? [searchLocation.latitude, searchLocation.longitude]
    : userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [21.1458, 79.0882];

  return (
    <div className="container section" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* 1. TOP HEADER & LOCATION SEARCH BAR */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF'
                }}
              >
                <Compass size={18} />
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Find Nearby Cars
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Explore verified private vehicles on an interactive map near your pickup spot
            </p>
          </div>

          {/* View Mode Switcher (Desktop & Mobile) */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center"
              style={{
                background: 'var(--bg-surface)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <button
                onClick={() => setViewMode('SPLIT')}
                className={`btn btn-sm ${viewMode === 'SPLIT' ? 'btn-primary' : ''}`}
                style={{
                  background: viewMode === 'SPLIT' ? undefined : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.65rem'
                }}
                title="Split Map & List View"
              >
                <Grid size={15} />
                <span className="desktop-only" style={{ marginLeft: '4px', fontSize: '0.8rem' }}>Split</span>
              </button>
              <button
                onClick={() => setViewMode('MAP')}
                className={`btn btn-sm ${viewMode === 'MAP' ? 'btn-primary' : ''}`}
                style={{
                  background: viewMode === 'MAP' ? undefined : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.65rem'
                }}
                title="Map Only"
              >
                <MapIcon size={15} />
                <span className="desktop-only" style={{ marginLeft: '4px', fontSize: '0.8rem' }}>Map</span>
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`btn btn-sm ${viewMode === 'LIST' ? 'btn-primary' : ''}`}
                style={{
                  background: viewMode === 'LIST' ? undefined : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.65rem'
                }}
                title="List Only"
              >
                <List size={15} />
                <span className="desktop-only" style={{ marginLeft: '4px', fontSize: '0.8rem' }}>List</span>
              </button>
            </div>

            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <SlidersHorizontal size={14} />
              <span>Filters {type || fuelType || radius !== 10 ? '•' : ''}</span>
            </button>
          </div>
        </div>

        {/* Location Search Input */}
        <div style={{ maxWidth: '720px' }}>
          <LocationSearch
            onSelectLocation={handleSelectLocation}
            showGpsButton={true}
            onGpsClick={handleGpsLocate}
            isLocating={isLocating}
            placeholder="Search pickup address, railway station, or landmark..."
          />
        </div>

        {/* Location Permission Alert */}
        {locationError && (
          <div
            className="flex items-center gap-2 animate-fade-in"
            style={{
              marginTop: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              fontSize: '0.82rem'
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{locationError}</span>
          </div>
        )}
      </div>

      {/* 2. MAIN LAYOUT: FILTERS DRAWER + MAP / LIST CONTENT */}
      {filterDrawerOpen && (
        <div
          className="animate-slide-down card"
          style={{
            marginBottom: '1.5rem',
            padding: '1.25rem',
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-strong)'
          }}
        >
          <MapFilters
            radius={radius}
            onRadiusChange={setRadius}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            selectedType={type}
            onTypeChange={setType}
            fuelType={fuelType}
            onFuelTypeChange={setFuelType}
            transmission={transmission}
            onTransmissionChange={setTransmission}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onReset={handleResetFilters}
          />
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchNearbyCars} />}

      {/* 3. SPLIT / MAP / LIST DISPLAY */}
      <div className={viewMode === 'SPLIT' ? 'nearby-layout' : ''}>
        {/* LEFT COLUMN: CARS LIST */}
        {(viewMode === 'SPLIT' || viewMode === 'LIST') && (
          <div className="nearby-sidebar" style={viewMode === 'LIST' ? { height: 'auto' } : {}}>
            {/* List Header Count & Quick Radius Bar */}
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Found <strong>{cars.length}</strong> vehicles within <strong>{radius} km</strong>
              </span>

              {/* Quick radius switcher */}
              <div className="flex items-center gap-1">
                {[5, 10, 20, 50].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`btn btn-sm ${radius === r ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable list of cars */}
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div
                className="card text-center flex flex-col items-center justify-center"
                style={{ padding: '3rem 1.5rem', minHeight: '300px' }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '1rem'
                  }}
                >
                  <MapPin size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No available cars found within {radius} km
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '380px', marginBottom: '1.25rem' }}>
                  Try increasing your search radius or changing your pickup dates to discover available vehicles.
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button onClick={() => setRadius(20)} className="btn btn-secondary btn-sm">
                    Expand to 20 km
                  </button>
                  <button onClick={() => setRadius(50)} className="btn btn-primary btn-sm">
                    Expand to 50 km
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={viewMode === 'LIST' ? 'cars-results-grid' : 'nearby-cars-scroll'}
                style={viewMode === 'LIST' ? { marginTop: '0.5rem' } : {}}
              >
                {cars.map((car) => {
                  const isSelected = selectedCar?.id === car.id;
                  const primaryImg =
                    car.imageUrl ||
                    (car.images && car.images.length > 0 ? car.images[0].url : null) ||
                    DEFAULT_CAR_IMG;

                  return (
                    <div
                      key={car.id}
                      ref={(el) => (carCardRefs.current[car.id] = el)}
                      onClick={() => setSelectedCar(car)}
                      className={`card card-hover flex flex-col ${isSelected ? 'selected-nearby-card' : ''}`}
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                        boxShadow: isSelected ? '0 0 15px var(--primary-glow)' : undefined,
                        transition: 'all 200ms ease'
                      }}
                    >
                      <div className="flex" style={{ flexWrap: 'wrap' }}>
                        {/* Thumbnail */}
                        <div
                          style={{
                            width: viewMode === 'LIST' ? '100%' : '140px',
                            minHeight: viewMode === 'LIST' ? '180px' : '130px',
                            position: 'relative',
                            background: '#1E293B',
                            flexShrink: 0
                          }}
                        >
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
                                bottom: '6px',
                                left: '6px',
                                background: 'rgba(15, 23, 42, 0.9)',
                                backdropFilter: 'blur(6px)',
                                color: '#38BDF8',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                border: '1px solid rgba(56, 189, 248, 0.3)'
                              }}
                            >
                              {formatDistance(car.distanceKm)}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '0.85rem', flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column' }}>
                          <div className="flex items-start justify-between gap-1" style={{ marginBottom: '4px' }}>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                                {car.brand} {car.model}
                              </h4>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {car.year} • {car.type || 'Sedan'}
                              </span>
                            </div>

                            {car.averageRating > 0 && (
                              <div
                                className="flex items-center gap-1"
                                style={{
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: 'var(--radius-sm)',
                                  color: '#FBBF24',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                <Star size={11} fill="#FBBF24" />
                                <span>{car.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px' }}>
                            <MapPin size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {car.locationName || car.location || 'Pickup Point'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <div>
                              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                                {formatCurrency(car.pricePerDay)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> / day</span>
                            </div>

                            <Link
                              to={`/cars/${car.id}`}
                              className="btn btn-primary btn-sm flex items-center gap-1"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>View</span>
                              <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: INTERACTIVE LEAFLET MAP */}
        {(viewMode === 'SPLIT' || viewMode === 'MAP') && (
          <div
            className="nearby-map-wrapper"
            style={viewMode === 'MAP' ? { height: 'calc(100vh - 200px)', minHeight: '520px' } : {}}
          >
            <CarMap
              center={activeCenter}
              zoom={12}
              userLocation={userLocation}
              searchLocation={searchLocation}
              cars={cars}
              selectedCar={selectedCar}
              onSelectCar={handleCarSelect}
              radiusKm={radius}
              showRadiusCircle={true}
              height="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyCars;
