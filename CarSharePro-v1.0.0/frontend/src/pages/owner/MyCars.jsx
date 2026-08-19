import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import { formatCurrency } from '../../utils/formatters';
import {
  Car,
  PlusCircle,
  Settings,
  Trash2,
  Calendar,
  Star,
  MapPin,
  AlertCircle
} from 'lucide-react';

const MyCars = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const fetchCars = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      setError('');
      const data = await carService.getCarsByOwner(user.userId);
      setCars(data || []);
    } catch (err) {
      console.error('Error fetching owner cars:', err);
      setError('Unable to load your vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [user]);

  const handleDeleteCar = async (carId, modelName) => {
    if (!window.confirm(`Are you sure you want to delete ${modelName}?`)) return;

    try {
      await carService.deleteCar(carId);
      setCars(cars.filter((c) => c.id !== carId));
      toast.success(`${modelName} deleted successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete car. It may have active bookings.');
    }
  };

  const paginatedCars = cars.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container section">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Vehicle Fleet</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage listed cars, availability windows, and photo galleries
          </p>
        </div>

        <Link to="/owner/cars/add" className="btn btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          <span>Add New Car</span>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCars} />}

      {loading ? (
        <Loading message="Loading your vehicle fleet..." />
      ) : cars.length > 0 ? (
        <div>
          <div className="grid grid-cols-3 gap-6">
            {paginatedCars.map((car) => {
              return (
                <div key={car.id} className="card card-glass card-hover flex flex-col" style={{ padding: '1.25rem' }}>
                  {/* Image */}
                  <div
                    style={{
                      height: '180px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'var(--bg-surface-raised)',
                      marginBottom: '1rem'
                    }}
                  >
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={car.model}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted">
                        <Car size={40} />
                      </div>
                    )}

                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <StatusBadge status={car.status} />
                    </div>

                    {!car.active && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        DEACTIVATED
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex items-start justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        {car.brand} {car.model}
                      </h3>
                      <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
                        {car.registrationNumber && (
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', letterSpacing: '0.5px' }}>
                            {car.registrationNumber}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {car.year} • {car.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {car.location && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
                      <MapPin size={13} style={{ color: 'var(--primary)' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.location}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between" style={{ marginBottom: '1rem', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatCurrency(car.pricePerDay)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / day</span>
                    </div>

                    <div className="flex items-center gap-1" style={{ color: '#FBBF24', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Star size={14} fill="#FBBF24" />
                      <span>{car.averageRating > 0 ? car.averageRating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  {car.rejectionReason && (
                    <div
                      className="card flex items-start gap-2"
                      style={{
                        background: 'var(--accent-rose-light)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#FCA5A5',
                        padding: '0.65rem',
                        fontSize: '0.8rem',
                        marginBottom: '1rem'
                      }}
                    >
                      <AlertCircle size={14} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                      <span>Rejection reason: {car.rejectionReason}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    className="flex items-center justify-between gap-2"
                    style={{
                      marginTop: 'auto',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '1rem'
                    }}
                  >
                    <Link
                      to={`/owner/cars/${car.id}/edit`}
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                      style={{ flex: 1 }}
                    >
                      <Settings size={14} />
                      <span>Manage / Dates</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteCar(car.id, `${car.brand} ${car.model}`)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      title="Delete Car"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
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
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No vehicles listed yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Start earning by listing your private car on DriveShare.
          </p>
          <Link to="/owner/cars/add" className="btn btn-primary">
            + List Your Car
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCars;
