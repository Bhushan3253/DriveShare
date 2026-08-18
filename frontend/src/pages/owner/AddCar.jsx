import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import carService from '../../services/carService';
import ErrorMessage from '../../components/ErrorMessage';
import { compressImage } from '../../utils/imageCompressor';
import { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../../utils/constants';
import { Car, UploadCloud, CheckCircle2, ArrowRight, Info, Plus } from 'lucide-react';

const AddCar = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    pricePerDay: '',
    location: '',
    description: '',
    imageUrl: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCar, setCreatedCar] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'seats' || name === 'pricePerDay' ? Number(value) : value
    });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.pricePerDay || !formData.location) {
      setError('Please fill in all required vehicle details.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Step 1: Create car on backend
      const newCar = await carService.addCar(formData);
      setCreatedCar(newCar);

      // Step 2: If image files selected, compress & upload to backend Cloudinary endpoint
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        for (const file of imageFiles) {
          try {
            const compressed = await compressImage(file);
            await carService.uploadCarImage(newCar.id, compressed);
          } catch (uploadErr) {
            console.error('Image upload warning:', uploadErr);
          }
        }
        setUploadingImages(false);
      }
    } catch (err) {
      console.error('Error creating car listing:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create car listing.';
      setError(typeof msg === 'string' ? msg : 'Error adding car.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div className="container-md">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
              Vehicle Registration
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>List Your Private Car</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Submit your vehicle specifications. Listings will be reviewed by admin before becoming active.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          {createdCar ? (
            <div className="card text-center" style={{ background: 'var(--bg-surface-raised)', padding: '2.5rem 1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald-light)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Car Submitted Successfully!</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
                Your <strong>{createdCar.brand} {createdCar.model}</strong> has been submitted for admin approval. You can now set availability windows in your fleet manager.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/owner/cars')}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <span>Go to My Fleet</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Basic specs grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Brand / Make *</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    className="form-input"
                    placeholder="e.g. Hyundai, Tata, Honda"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input
                    type="text"
                    name="model"
                    required
                    className="form-input"
                    placeholder="e.g. Creta, Nexon, City"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturing Year *</label>
                  <input
                    type="number"
                    name="year"
                    required
                    min={2005}
                    max={new Date().getFullYear() + 1}
                    className="form-input"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Type *</label>
                  <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                    {CAR_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fuel Type *</label>
                  <select name="fuelType" className="form-select" value={formData.fuelType} onChange={handleChange}>
                    {FUEL_TYPES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transmission *</label>
                  <select name="transmission" className="form-select" value={formData.transmission} onChange={handleChange}>
                    {TRANSMISSIONS.map((tr) => (
                      <option key={tr} value={tr}>{tr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Seating Capacity *</label>
                  <input
                    type="number"
                    name="seats"
                    required
                    min={2}
                    max={12}
                    className="form-input"
                    value={formData.seats}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Price (₹ / day) *</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    required
                    min={500}
                    step={100}
                    className="form-input"
                    placeholder="e.g. 2500"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">City & Pickup Area *</label>
                <input
                  type="text"
                  name="location"
                  required
                  className="form-input"
                  placeholder="e.g. Bandra West, Mumbai"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description & Rules</label>
                <textarea
                  name="description"
                  rows={3}
                  className="form-textarea"
                  placeholder="Describe your car condition, fastag availability, clean sanitized vehicle, etc."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Image Upload Input */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label className="form-label flex items-center gap-1">
                  <UploadCloud size={16} style={{ color: 'var(--primary)' }} />
                  Vehicle Photos (Cloudinary Upload)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Upload high resolution front, side, and interior photos.
                </span>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={loading || uploadingImages}
                  className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
                >
                  {loading || uploadingImages ? (
                    <span>{uploadingImages ? 'Uploading Photos...' : 'Registering Car...'}</span>
                  ) : (
                    <>
                      <span>Submit Car Listing</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCar;
