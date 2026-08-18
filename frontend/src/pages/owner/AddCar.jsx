import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import carService from '../../services/carService';
import ErrorMessage from '../../components/ErrorMessage';
import { compressImage } from '../../utils/imageCompressor';
import { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS } from '../../utils/constants';
import {
  Car,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  FileCheck,
  Image as ImageIcon,
  AlertCircle,
  X
} from 'lucide-react';

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
    registrationNumber: '',
    chassisNumber: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    pucExpiry: ''
  });

  // Document File States & Live Previews
  const [rcFile, setRcFile] = useState(null);
  const [rcPreview, setRcPreview] = useState(null);

  const [insuranceFile, setInsuranceFile] = useState(null);
  const [insurancePreview, setInsurancePreview] = useState(null);

  const [pucFile, setPucFile] = useState(null);
  const [pucPreview, setPucPreview] = useState(null);

  // Gallery Photos
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [createdCar, setCreatedCar] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'seats' || name === 'pricePerDay'
        ? (value === '' ? '' : Number(value))
        : (name === 'registrationNumber' ? value.toUpperCase() : value)
    });
    if (error) setError('');
  };

  const handleDocumentChange = (docType, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      if (docType === 'RC') {
        setRcFile(file);
        setRcPreview(previewUrl);
      } else if (docType === 'INSURANCE') {
        setInsuranceFile(file);
        setInsurancePreview(previewUrl);
      } else if (docType === 'PUC') {
        setPucFile(file);
        setPucPreview(previewUrl);
      }
    }
  };

  const removeDoc = (docType) => {
    if (docType === 'RC') {
      setRcFile(null);
      setRcPreview(null);
    } else if (docType === 'INSURANCE') {
      setInsuranceFile(null);
      setInsurancePreview(null);
    } else if (docType === 'PUC') {
      setPucFile(null);
      setPucPreview(null);
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setImageFiles(selected);
      const previews = selected.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.pricePerDay || !formData.location || !formData.registrationNumber) {
      setError('Please fill in all required vehicle details, including registration number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadStatus('Registering vehicle specification...');

      // 1. Create Car Entity
      const payload = {
        ...formData,
        registrationNumber: formData.registrationNumber.trim().toUpperCase()
      };
      const newCar = await carService.addCar(payload);
      setCreatedCar(newCar);

      // 2. Upload Compliance Documents if selected
      if (rcFile) {
        setUploadStatus('Uploading Registration Certificate (RC)...');
        try {
          const compressed = await compressImage(rcFile);
          await carService.uploadCarDocument(newCar.id, 'RC', compressed);
        } catch (err) {
          console.warn('RC doc upload warning:', err);
        }
      }

      if (insuranceFile) {
        setUploadStatus('Uploading Insurance Policy document...');
        try {
          const compressed = await compressImage(insuranceFile);
          await carService.uploadCarDocument(newCar.id, 'INSURANCE', compressed);
        } catch (err) {
          console.warn('Insurance doc upload warning:', err);
        }
      }

      if (pucFile) {
        setUploadStatus('Uploading PUC Certificate...');
        try {
          const compressed = await compressImage(pucFile);
          await carService.uploadCarDocument(newCar.id, 'PUC', compressed);
        } catch (err) {
          console.warn('PUC doc upload warning:', err);
        }
      }

      // 3. Upload Gallery Images
      if (imageFiles.length > 0) {
        setUploadStatus('Uploading vehicle photos...');
        for (let i = 0; i < imageFiles.length; i++) {
          try {
            setUploadStatus(`Uploading vehicle photo ${i + 1} of ${imageFiles.length}...`);
            const compressed = await compressImage(imageFiles[i]);
            await carService.uploadCarImage(newCar.id, compressed);
          } catch (uploadErr) {
            console.error('Image upload warning:', uploadErr);
          }
        }
      }

      setUploadStatus('');
    } catch (err) {
      console.error('Error creating car listing:', err);
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to create car listing.';
      setError(typeof msg === 'string' ? msg : 'Error adding car.');
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="container section">
      <div className="container-md">
        <div className="card card-glass" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
              Host Vehicle Registration
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>List Your Private Car</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Submit your vehicle specifications, registration number, and compliance documents for admin moderation.
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
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Car & Documents Submitted!</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1rem', fontSize: '0.95rem' }}>
                Your <strong>{createdCar.brand} {createdCar.model}</strong> ({formData.registrationNumber}) has been submitted for admin verification.
              </p>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#6EE7B7',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  maxWidth: '480px',
                  margin: '0 auto 1.5rem',
                  fontSize: '0.85rem'
                }}
              >
                ✓ Plate Number & Documents linked for moderation review
              </div>

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
              {/* SECTION 1: BASIC SPECS */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Car size={18} style={{ color: 'var(--primary)' }} />
                  <span>1. Vehicle Specifications</span>
                </h3>

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

                <div className="form-group" style={{ marginTop: '1rem' }}>
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

                <div className="form-group">
                  <label className="form-label">Description & Rules</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="form-textarea"
                    placeholder="Describe vehicle condition, Fastag, music system, cleanliness rules..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* SECTION 2: IDENTITY & COMPLIANCE DATA */}
              <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>2. Vehicle Identification & Legal Info</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">
                      Registration / License Plate Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      required
                      className="form-input"
                      placeholder="e.g. MH 12 AB 1234"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Official RTO registration number.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chassis / VIN Number (Optional)</label>
                    <input
                      type="text"
                      name="chassisNumber"
                      className="form-input"
                      placeholder="e.g. MA3EWFB1S00123456"
                      value={formData.chassisNumber}
                      onChange={handleChange}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Insurance Policy Number</label>
                    <input
                      type="text"
                      name="insurancePolicyNumber"
                      className="form-input"
                      placeholder="e.g. POL-987654321"
                      value={formData.insurancePolicyNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Insurance Expiry Date</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      className="form-input"
                      value={formData.insuranceExpiry}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PUC (Pollution) Expiry Date</label>
                    <input
                      type="date"
                      name="pucExpiry"
                      className="form-input"
                      value={formData.pucExpiry}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: COMPLIANCE DOCUMENTS UPLOAD */}
              <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <span>3. Vehicle Compliance Documents (Cloudinary)</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Upload clear photos or scans of your documents. These are confidential and reviewed only by admins for verification.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {/* RC Upload Card */}
                  <div
                    style={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Registration Certificate (RC)
                    </div>
                    {rcPreview ? (
                      <div style={{ position: 'relative', height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <img src={rcPreview} alt="RC Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeDoc('RC')}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'block', padding: '1rem 0.5rem' }}>
                        <FileText size={28} style={{ margin: '0 auto 0.5rem', color: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', fontWeight: 600 }}>Choose RC Image</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Front or smart card scan</span>
                        <input type="file" accept="image/*" onChange={(e) => handleDocumentChange('RC', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* Insurance Upload Card */}
                  <div
                    style={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Insurance Certificate
                    </div>
                    {insurancePreview ? (
                      <div style={{ position: 'relative', height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <img src={insurancePreview} alt="Insurance Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeDoc('INSURANCE')}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'block', padding: '1rem 0.5rem' }}>
                        <ShieldCheck size={28} style={{ margin: '0 auto 0.5rem', color: 'var(--accent-emerald)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'block', fontWeight: 600 }}>Choose Policy Image</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active policy certificate</span>
                        <input type="file" accept="image/*" onChange={(e) => handleDocumentChange('INSURANCE', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>

                  {/* PUC Upload Card */}
                  <div
                    style={{
                      background: 'var(--bg-surface-raised)',
                      border: '1px dashed var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      PUC Certificate
                    </div>
                    {pucPreview ? (
                      <div style={{ position: 'relative', height: '110px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <img src={pucPreview} alt="PUC Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeDoc('PUC')}
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer', display: 'block', padding: '1rem 0.5rem' }}>
                        <FileCheck size={28} style={{ margin: '0 auto 0.5rem', color: 'var(--accent-cyan)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'block', fontWeight: 600 }}>Choose PUC Image</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Valid pollution slip</span>
                        <input type="file" accept="image/*" onChange={(e) => handleDocumentChange('PUC', e)} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: VEHICLE PHOTOS */}
              <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} style={{ color: 'var(--accent-purple)' }} />
                  <span>4. Vehicle Gallery Photos</span>
                </h3>
                <div className="form-group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="form-input"
                    style={{ padding: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Upload exterior front, side, and interior photos.
                  </span>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {imagePreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Photo ${idx + 1}`}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block btn-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>{uploadStatus || 'Processing listing...'}</span>
                  ) : (
                    <>
                      <span>Submit Car Listing & Documents</span>
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

