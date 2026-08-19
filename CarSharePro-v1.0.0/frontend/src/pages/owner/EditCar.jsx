import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import carService from '../../services/carService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import LocationPicker from '../../components/map/LocationPicker';
import { compressImage } from '../../utils/imageCompressor';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  UploadCloud,
  Trash2,
  CheckCircle,
  Star,
  Plus,
  ArrowLeft,
  Image as ImageIcon,
  ShieldCheck,
  FileText,
  FileCheck,
  Save,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const EditCar = () => {
  const { id } = useParams();
  const toast = useToast();

  const [car, setCar] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Editable vehicle details
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    chassisNumber: '',
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    pucExpiry: '',
    pricePerDay: '',
    location: '',
    locationName: '',
    latitude: null,
    longitude: null,
    description: ''
  });
  const [savingDetails, setSavingDetails] = useState(false);

  // New Availability Window Form
  const todayStr = new Date().toISOString().split('T')[0];
  const [availStart, setAvailStart] = useState('');
  const [availEnd, setAvailEnd] = useState('');
  const [addingAvail, setAddingAvail] = useState(false);

  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null); // 'RC' | 'INSURANCE' | 'PUC'

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
      setVehicleForm({
        registrationNumber: carData.registrationNumber || '',
        chassisNumber: carData.chassisNumber || '',
        insurancePolicyNumber: carData.insurancePolicyNumber || '',
        insuranceExpiry: carData.insuranceExpiry || '',
        pucExpiry: carData.pucExpiry || '',
        pricePerDay: carData.pricePerDay || '',
        location: carData.location || '',
        locationName: carData.locationName || carData.location || '',
        latitude: carData.latitude ?? null,
        longitude: carData.longitude ?? null,
        description: carData.description || ''
      });
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

  const handleVehicleFormChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm({
      ...vehicleForm,
      [name]: name === 'pricePerDay' ? (value === '' ? '' : Number(value)) : (name === 'registrationNumber' ? value.toUpperCase() : value)
    });
    if (saveSuccess) setSaveSuccess('');
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (vehicleForm.latitude !== null && vehicleForm.longitude !== null) {
      if (vehicleForm.latitude < -90 || vehicleForm.latitude > 90 || vehicleForm.longitude < -180 || vehicleForm.longitude > 180) {
        toast.warning('Invalid geographic coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.');
        return;
      }
    }

    try {
      setSavingDetails(true);
      setError('');
      const updated = await carService.updateCar(id, {
        ...vehicleForm,
        location: vehicleForm.locationName || vehicleForm.location,
        locationName: vehicleForm.locationName || vehicleForm.location
      });
      setCar(updated);
      toast.success('Vehicle details saved successfully!');
      setSaveSuccess('Vehicle details saved successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle details.');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleDocumentUpload = async (docType, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setUploadingDoc(docType);
        const compressed = await compressImage(file);
        const updated = await carService.uploadCarDocument(id, docType, compressed);
        setCar(updated);
        toast.success(`${docType.toUpperCase()} document uploaded successfully!`);
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to upload ${docType} document.`);
      } finally {
        setUploadingDoc(null);
      }
    }
  };

  const handleDeleteDocument = async (docType) => {
    if (!window.confirm(`Delete ${docType} document?`)) return;
    try {
      setUploadingDoc(docType);
      const updated = await carService.deleteCarDocument(id, docType);
      setCar(updated);
      toast.success(`${docType.toUpperCase()} document removed.`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${docType} document.`);
    } finally {
      setUploadingDoc(null);
    }
  };

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
      toast.success('Availability window added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add availability window.');
    } finally {
      setAddingAvail(false);
    }
  };

  const handleDeleteAvailability = async (availId) => {
    try {
      await carService.deleteAvailability(availId);
      setAvailabilities(availabilities.filter((a) => a.id !== availId));
      toast.success('Availability window removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove availability window.');
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
        toast.success('Vehicle photo uploaded!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload photo.');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSetPrimary = async (publicId) => {
    try {
      const updated = await carService.setPrimaryImage(id, publicId);
      setCar(updated);
      toast.success('Primary cover image updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set primary image.');
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      const updated = await carService.deleteCarImage(id, publicId);
      setCar(updated);
      toast.success('Vehicle photo deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete photo.');
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
            {car.registrationNumber && (
              <span className="badge badge-purple" style={{ letterSpacing: '1px', fontWeight: 700 }}>
                {car.registrationNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Left Column: Vehicle Details & Compliance Documents */}
        <div className="flex flex-col gap-6">
          {/* Card 1: Identity & Details Form */}
          <div className="card card-glass" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vehicle Identity & Details</h2>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveDetails}>
              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Registration Number *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    required
                    className="form-input"
                    value={vehicleForm.registrationNumber}
                    onChange={handleVehicleFormChange}
                    style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Daily Price (₹)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    required
                    min={500}
                    step={100}
                    className="form-input"
                    value={vehicleForm.pricePerDay}
                    onChange={handleVehicleFormChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Insurance Policy #</label>
                  <input
                    type="text"
                    name="insurancePolicyNumber"
                    className="form-input"
                    value={vehicleForm.insurancePolicyNumber}
                    onChange={handleVehicleFormChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Insurance Expiry</label>
                  <input
                    type="date"
                    name="insuranceExpiry"
                    className="form-input"
                    value={vehicleForm.insuranceExpiry}
                    onChange={handleVehicleFormChange}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>PUC Expiry Date</label>
                  <input
                    type="date"
                    name="pucExpiry"
                    className="form-input"
                    value={vehicleForm.pucExpiry}
                    onChange={handleVehicleFormChange}
                  />
                </div>
              </div>

              {/* Location & GPS Coordinate Picker */}
              <div style={{ marginBottom: '1.25rem' }}>
                <LocationPicker
                  latitude={vehicleForm.latitude}
                  longitude={vehicleForm.longitude}
                  locationName={vehicleForm.locationName || vehicleForm.location}
                  required={true}
                  onChange={({ latitude, longitude, locationName }) => {
                    setVehicleForm((prev) => ({
                      ...prev,
                      latitude,
                      longitude,
                      locationName,
                      location: locationName
                    }));
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Description & Features</label>
                <textarea
                  name="description"
                  rows={2}
                  className="form-textarea"
                  value={vehicleForm.description}
                  onChange={handleVehicleFormChange}
                />
              </div>

              <button
                type="submit"
                disabled={savingDetails}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>{savingDetails ? 'Saving...' : 'Save Vehicle Info'}</span>
              </button>
            </form>
          </div>

          {/* Card 2: Compliance Documents (RC, Insurance, PUC) */}
          <div className="card card-glass" style={{ padding: '2rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <FileCheck size={20} style={{ color: 'var(--accent-cyan)' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verification Documents</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Documents submitted to Cloudinary for admin approval and verification.
            </p>

            <div className="flex flex-col gap-4">
              {/* RC Doc */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Registration Certificate (RC)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: car.rcDocUrl ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {car.rcDocUrl ? '✓ Uploaded & Active' : 'Not uploaded yet'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {car.rcDocUrl && (
                    <a href={car.rcDocUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm flex items-center gap-1">
                      <ExternalLink size={12} />
                      <span>View</span>
                    </a>
                  )}
                  <label className="btn btn-outline btn-sm flex items-center gap-1" style={{ cursor: 'pointer' }}>
                    <UploadCloud size={12} />
                    <span>{uploadingDoc === 'RC' ? '...' : (car.rcDocUrl ? 'Replace' : 'Upload')}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload('RC', e)} style={{ display: 'none' }} />
                  </label>
                  {car.rcDocUrl && (
                    <button onClick={() => handleDeleteDocument('RC')} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Insurance Doc */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Insurance Policy Document</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: car.insuranceDocUrl ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {car.insuranceDocUrl ? '✓ Uploaded & Active' : 'Not uploaded yet'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {car.insuranceDocUrl && (
                    <a href={car.insuranceDocUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm flex items-center gap-1">
                      <ExternalLink size={12} />
                      <span>View</span>
                    </a>
                  )}
                  <label className="btn btn-outline btn-sm flex items-center gap-1" style={{ cursor: 'pointer' }}>
                    <UploadCloud size={12} />
                    <span>{uploadingDoc === 'INSURANCE' ? '...' : (car.insuranceDocUrl ? 'Replace' : 'Upload')}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload('INSURANCE', e)} style={{ display: 'none' }} />
                  </label>
                  {car.insuranceDocUrl && (
                    <button onClick={() => handleDeleteDocument('INSURANCE')} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* PUC Doc */}
              <div style={{ background: 'var(--bg-surface-raised)', padding: '1rem', borderRadius: 'var(--radius-md)' }} className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>PUC Certificate</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: car.pucDocUrl ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {car.pucDocUrl ? '✓ Uploaded & Active' : 'Not uploaded yet'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {car.pucDocUrl && (
                    <a href={car.pucDocUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm flex items-center gap-1">
                      <ExternalLink size={12} />
                      <span>View</span>
                    </a>
                  )}
                  <label className="btn btn-outline btn-sm flex items-center gap-1" style={{ cursor: 'pointer' }}>
                    <UploadCloud size={12} />
                    <span>{uploadingDoc === 'PUC' ? '...' : (car.pucDocUrl ? 'Replace' : 'Upload')}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleDocumentUpload('PUC', e)} style={{ display: 'none' }} />
                  </label>
                  {car.pucDocUrl && (
                    <button onClick={() => handleDeleteDocument('PUC')} className="btn btn-outline btn-sm" style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239,68,68,0.3)' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Availability Windows & Photos */}
        <div className="flex flex-col gap-6">
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
    </div>
  );
};

export default EditCar;

