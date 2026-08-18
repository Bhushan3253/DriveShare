import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { compressImage } from '../../utils/imageCompressor';
import { formatDate } from '../../utils/formatters';
import {
  Calendar,
  UploadCloud,
  Trash2,
  CheckCircle,
  Star,
  Plus,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

const EditCar = () => {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New Availability Window Form
  const todayStr = new Date().toISOString().split('T')[0];
  const [availStart, setAvailStart] = useState('');
  const [availEnd, setAvailEnd] = useState('');
  const [addingAvail, setAddingAvail] = useState(false);

  // New Image Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCarAndAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      const [carData, availData] = await Promise.all([
        carService.getCarById(id),
        carService.getCarAvailability(id).catch(() => [])
      ]);
      setCar(carData);
      setAvailabilities(availData || []);
    } catch (err) {
      console.error('Error fetching car data:', err);
      setError('Unable to load car details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarAndAvailability();
  }, [id]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (!availStart || !availEnd) return;

    try {
      setAddingAvail(true);
      const newAvail = await carService.addAvailability(id, {
        startDate: availStart,
        endDate: availEnd
      });
      setAvailabilities([...availabilities, newAvail]);
      setAvailStart('');
      setAvailEnd('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add availability window.');
    } finally {
      setAddingAvail(false);
    }
  };

  const handleDeleteAvailability = async (availId) => {
    try {
      await carService.deleteAvailability(availId);
      setAvailabilities(availabilities.filter((a) => a.id !== availId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove availability window.');
    }
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingImage(true);
        const compressed = await compressImage(file);
        const updatedCar = await carService.uploadCarImage(id, compressed);
        setCar(updatedCar);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to upload photo.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSetPrimary = async (publicId) => {
    try {
      const updated = await carService.setPrimaryImage(id, publicId);
      setCar(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set primary image.');
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const updated = await carService.deleteCarImage(id, publicId);
      setCar(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete photo.');
    }
  };

  if (loading) {
    return <Loading message="Loading car configuration..." fullScreen />;
  }

  if (error || !car) {
    return (
      <div className="container section">
        <ErrorMessage message={error || 'Car not found'} />
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <Link to="/owner/cars" className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Fleet</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              {car.brand} {car.model} ({car.year})
            </h1>
            <StatusBadge status={car.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Section 1: Availability Windows Manager */}
        <div className="card card-glass" style={{ padding: '2rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Available Dates</h2>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Specify the date ranges when your car is available for renters to book (e.g. weekends).
          </p>

          {/* Add Availability Form */}
          <form onSubmit={handleAddAvailability} style={{ background: 'var(--bg-surface-raised)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>+ Add Date Window</h3>
            <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  min={todayStr}
                  value={availStart}
                  onChange={(e) => setAvailStart(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  min={availStart || todayStr}
                  value={availEnd}
                  onChange={(e) => setAvailEnd(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={addingAvail}
              className="btn btn-primary btn-sm btn-block flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              <span>{addingAvail ? 'Adding...' : 'Add Availability Window'}</span>
            </button>
          </form>

          {/* Existing Availabilities List */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Current Available Windows</h3>
            {availabilities.length > 0 ? (
              <div className="flex flex-col gap-2">
                {availabilities.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: 'var(--bg-surface-raised)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      <Calendar size={14} style={{ color: 'var(--accent-emerald)' }} />
                      <span>{formatDate(a.startDate)} to {formatDate(a.endDate)}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteAvailability(a.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--accent-rose)', padding: '0.25rem 0.5rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active availability windows set. Add dates above to allow bookings.
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Photos & Cloudinary Gallery */}
        <div className="card card-glass" style={{ padding: '2rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div className="flex items-center gap-2">
              <ImageIcon size={20} style={{ color: 'var(--accent-cyan)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vehicle Photos</h2>
            </div>

            <label className="btn btn-secondary btn-sm flex items-center gap-1" style={{ cursor: 'pointer' }}>
              <UploadCloud size={14} />
              <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Manage images uploaded to Cloudinary. Click on a photo to make it the primary listing picture.
          </p>

          {car.images && car.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {car.images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: img.primary ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: '#000'
                  }}
                >
                  <img src={img.url} alt="Car" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  {/* Primary Badge */}
                  {img.primary && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'var(--primary)',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      PRIMARY
                    </div>
                  )}

                  {/* Image Controls */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: '4px'
                    }}
                  >
                    {!img.primary && (
                      <button
                        onClick={() => handleSetPrimary(img.publicId)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        title="Set as primary photo"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img.publicId)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.25rem 0.5rem' }}
                      title="Delete photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem' }}>No photos uploaded yet for this vehicle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCar;
