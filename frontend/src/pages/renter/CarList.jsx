import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import carService from '../../services/carService';
import CarCard from '../../components/CarCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Pagination from '../../components/Pagination';
import { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../../utils/constants';
import { Filter, RotateCcw, Search, Car, SlidersHorizontal, X } from 'lucide-react';

const CarList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError('');
      setCurrentPage(1); // Reset to page 1 on new search

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

      // Update URL query params
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
  }, []);

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
    setCurrentPage(1);
    setSearchParams({}, { replace: true });

    carService.getAvailableCars().then((data) => setCars(data || [])).catch(console.error);
  };

  // Slice cars for active page
  const paginatedCars = cars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container section">
      {/* Title & Mobile Filter Trigger */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Explore Available Cars
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Choose from vetted private vehicles in your neighbourhood
          </p>
        </div>

        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn btn-secondary mobile-only flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
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
                placeholder="e.g. Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Brand */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Brand / Make</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Hyundai, Honda, Tata"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            {/* Vehicle Type */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Body Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Body Types</option>
                {CAR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
              <label className="form-label">Price Range (₹ / day)</label>
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

        {/* Cars Result Grid */}
        <main className="flex-1" style={{ width: '100%', minWidth: 0 }}>
          {error && <ErrorMessage message={error} onRetry={fetchCars} />}

          {loading ? (
            <Loading message="Filtering available vehicles..." />
          ) : cars.length > 0 ? (
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Showing <strong>{paginatedCars.length}</strong> of <strong>{cars.length}</strong> available {cars.length === 1 ? 'vehicle' : 'vehicles'}
                </span>
              </div>

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
