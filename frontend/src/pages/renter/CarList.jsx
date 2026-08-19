import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import carService from '../../services/carService';
import CarCard from '../../components/CarCard';
import SkeletonCard from '../../components/SkeletonCard';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import CarMap from '../../components/map/CarMap';
import { getUserCurrentPosition } from '../../utils/distance';
import { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import {
  Filter,
  RotateCcw,
  Search,
  Car,
  SlidersHorizontal,
  X,
  Navigation,
  MapPin,
  Map as MapIcon,
  Grid,
  Zap,
  Star,
  ShieldCheck
} from 'lucide-react';

const CarList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' or 'MAP'
  const [geoLocating, setGeoLocating] = useState(false);
  const [selectedMapCar, setSelectedMapCar] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter States
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [sortBy, setSortBy] = useState('RELEVANCE');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      setCurrentPage(1);

      const queryParams = {};
      if (location) queryParams.location = location;
      if (brand) queryParams.brand = brand;
      if (type) queryParams.type = type;
      if (fuelType) queryParams.fuelType = fuelType;
      if (transmission) queryParams.transmission = transmission;
      if (minPrice) queryParams.minPrice = minPrice;
      if (maxPrice) queryParams.maxPrice = maxPrice;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      setSearchParams(queryParams, { replace: true });

      const data = await carService.searchCars(queryParams);
      setCars(data || []);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Unable to fetch cars from the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [type]); // Refetch when type chip changes

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    fetchCars();
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setLocation('');
    setBrand('');
    setType('');
    setFuelType('');
    setTransmission('');
    setMinPrice('');
    setMaxPrice('');
    setStartDate('');
    setEndDate('');
    setSortBy('RELEVANCE');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });

    carService.getAvailableCars().then((data) => setCars(data || [])).catch(console.error);
  };

  const handleNearMeGPS = async () => {
    try {
      setGeoLocating(true);
      await getUserCurrentPosition();
      navigate('/nearby?radius=15');
    } catch (err) {
      alert(err.message || 'Unable to retrieve your location. Please check location permissions.');
    } finally {
      setGeoLocating(false);
    }
  };

  // Sort logic
  const sortedCars = [...cars].sort((a, b) => {
    if (sortBy === 'PRICE_LOW') return a.pricePerDay - b.pricePerDay;
    if (sortBy === 'PRICE_HIGH') return b.pricePerDay - a.pricePerDay;
    if (sortBy === 'RATING') return (b.averageRating || 0) - (a.averageRating || 0);
    return 0;
  });

  const paginatedCars = sortedCars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container section">
      {/* Title & Top Bar */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Explore Available Cars
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Verified private cars with insurance protection in your city
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* GPS Near Me button */}
          <button
            onClick={handleNearMeGPS}
            disabled={geoLocating}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
            style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(6,182,212,0.3)' }}
          >
            <Navigation size={14} className={geoLocating ? 'animate-pulse' : ''} />
            <span>{geoLocating ? 'Locating...' : 'Near Me (GPS)'}</span>
          </button>

          {/* View Mode Toggle: Grid vs Map */}
          <div className="flex items-center" style={{ background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('GRID')}
              className={`btn btn-sm ${viewMode === 'GRID' ? 'btn-primary' : ''}`}
              style={{ background: viewMode === 'GRID' ? undefined : 'transparent', border: 'none', padding: '0.35rem 0.6rem' }}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`btn btn-sm ${viewMode === 'MAP' ? 'btn-primary' : ''}`}
              style={{ background: viewMode === 'MAP' ? undefined : 'transparent', border: 'none', padding: '0.35rem 0.6rem' }}
              title="Map View"
            >
              <MapIcon size={15} />
            </button>
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn btn-secondary mobile-only flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* QUICK CATEGORY CHIPS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ marginBottom: '1.75rem' }}>
        {['', 'SUV', 'Sedan', 'Hatchback', 'Luxury', 'Electric'].map((cat) => (
          <button
            key={cat || 'ALL'}
            onClick={() => setType(cat)}
            className={`btn btn-sm ${type === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
          >
            {cat || 'All Vehicles'}
          </button>
        ))}
      </div>

      {/* Mobile Filter Backdrop */}
      {mobileFilterOpen && (
        <div
          className="mobile-filter-backdrop animate-fade-in"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      <div className="cars-page-layout">
        {/* Sidebar Filters Desktop & Mobile Drawer */}
        <aside className={`car-filter-sidebar ${mobileFilterOpen ? 'mobile-filter-drawer animate-slide-up' : 'desktop-only'}`}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <div className="flex items-center gap-2">
              <Filter size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Filter Vehicles</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="flex items-center gap-1"
                style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
              {mobileFilterOpen && (
                <button onClick={() => setMobileFilterOpen(false)} className="mobile-only btn btn-secondary btn-sm" style={{ padding: '0.3rem' }}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleApplyFilters} className="flex flex-col gap-4" style={{ width: '100%' }}>
            {/* Location */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">City / Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mumbai, Pune"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Rental Dates</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="form-input"
                  min={todayStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="form-input"
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Brand */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Brand / Make</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hyundai, Tata, Honda"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* Fuel Type */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fuel Type</label>
              <select className="form-select" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                <option value="">All Fuel Types</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Transmission</label>
              <select className="form-select" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                <option value="">All Transmissions</option>
                {TRANSMISSIONS.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Daily Price (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary btn-block flex items-center justify-center gap-2" style={{ marginTop: '0.5rem' }}>
              <Search size={16} />
              <span>Apply Filters</span>
            </button>
          </form>
        </aside>

        {/* Cars Result Area (Grid or Map View) */}
        <main className="flex-1" style={{ width: '100%', minWidth: 0 }}>
          {error && <ErrorMessage message={error} onRetry={fetchCars} />}

          {/* Sort & Count Header */}
          {!loading && cars.length > 0 && (
            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1.25rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing <strong>{paginatedCars.length}</strong> of <strong>{cars.length}</strong> available vehicles
              </span>

              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="RELEVANCE">Featured & Best Match</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="RATING">Top Rated</option>
                </select>
              </div>
            </div>
          )}

          {/* SKELETON SHIMMER LOADERS */}
          {loading ? (
            <div className="cars-results-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : viewMode === 'MAP' ? (
            /* REAL INTERACTIVE LEAFLET OPENSTREETMAP VIEW */
            <div
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem',
                minHeight: '520px'
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div className="flex items-center gap-2">
                  <MapIcon size={20} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Interactive Vehicle Map</h3>
                </div>
                <Link
                  to="/nearby?radius=20"
                  className="btn btn-secondary btn-sm flex items-center gap-1"
                  style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}
                >
                  <Navigation size={13} />
                  <span>Open Full Nearby Map</span>
                </Link>
              </div>

              <div
                style={{
                  height: '460px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <CarMap
                  cars={cars}
                  selectedCar={selectedMapCar}
                  onSelectCar={setSelectedMapCar}
                  showRadiusCircle={false}
                  height="100%"
                />
              </div>
            </div>
          ) : cars.length > 0 ? (
            /* STANDARD GRID VIEW */
            <div>
              <div className="cars-results-grid">
                {paginatedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalItems={cars.length}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          ) : (
            <div className="card text-center" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)' }}>
              <Car size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No cars match your criteria</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Try adjusting your search location, dates, or body type filters to find available cars.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .cars-page-layout {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          width: 100%;
        }

        @media (max-width: 859px) {
          .cars-page-layout {
            flex-direction: column;
            gap: 1rem;
          }

          .mobile-filter-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            z-index: 9998;
          }

          .car-filter-sidebar.mobile-filter-drawer {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            background: #0B0F19 !important;
            z-index: 9999 !important;
            padding: 1.5rem 1.25rem 5.5rem 1.25rem !important;
            overflow-y: auto !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CarList;

