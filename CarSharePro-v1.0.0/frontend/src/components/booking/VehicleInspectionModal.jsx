import React, { useState } from 'react';
import bookingService from '../../services/bookingService';
import { compressImage } from '../../utils/imageCompressor';
import {
  Gauge,
  Fuel,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Car,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front View', hint: 'Bumper, hood, headlights' },
  { key: 'rear', label: 'Rear View', hint: 'Tailgate, bumper, license plate' },
  { key: 'left', label: 'Driver Side (Left)', hint: 'Doors, fenders, alloy wheels' },
  { key: 'right', label: 'Passenger Side (Right)', hint: 'Doors, fenders, alloy wheels' },
  { key: 'dashboard', label: 'Dashboard & Odometer', hint: 'Odometer reading & fuel gauge' },
  { key: 'interior', label: 'Interior & Seats', hint: 'Cabin cleanliness, upholstery' }
];

const PRE_CHECKLIST = [
  'All 4 Tires & Spare Tire Present',
  'Jack & Tool Kit Verified',
  'Fastag Verified & Active',
  'RC & Insurance Copies Inside Glovebox',
  'Pristine / Clean Interior'
];

const VehicleInspectionModal = ({
  booking,
  mode = 'CHECK_IN', // 'CHECK_IN' | 'RETURN'
  onClose,
  onSuccess
}) => {
  const isCheckIn = mode === 'CHECK_IN';

  // Step state (1: Readings, 2: Photos, 3: Damage & Notes)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [odometer, setOdometer] = useState(
    isCheckIn
      ? (booking.startOdometer || '')
      : (booking.endOdometer || (booking.startOdometer ? booking.startOdometer + 150 : ''))
  );
  const [fuelLevel, setFuelLevel] = useState(
    isCheckIn ? (booking.startFuelLevel || '100%') : (booking.endFuelLevel || '100%')
  );

  // Photos state: mapping slot key -> { file, previewUrl, uploadedUrl }
  const [photos, setPhotos] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);

  // Damage & Notes
  const [checklist, setChecklist] = useState([]);
  const [hasDamageReported, setHasDamageReported] = useState(booking.hasDamageReported || false);
  const [damageDescription, setDamageDescription] = useState(booking.damageDescription || '');
  const [damageSeverity, setDamageSeverity] = useState('LOW');
  const [notes, setNotes] = useState(
    isCheckIn ? (booking.checkInNotes || '') : (booking.checkOutNotes || '')
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle single slot photo selection & compression
  const handlePhotoSelect = async (slotKey, e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        setUploadingSlot(slotKey);
        setErrorMsg('');
        // Compress client-side
        const compressed = await compressImage(originalFile, 1200, 1200, 0.85);
        const previewUrl = URL.createObjectURL(compressed);

        // Upload to Cloudinary
        const uploadResult = await bookingService.uploadInspectionPhoto(
          booking.id,
          mode,
          compressed
        );

        setPhotos((prev) => ({
          ...prev,
          [slotKey]: {
            previewUrl,
            uploadedUrl: uploadResult.url || previewUrl
          }
        }));
      } catch (err) {
        console.error('Error uploading inspection photo:', err);
        setErrorMsg(`Failed to upload photo for ${slotKey}. Please try again.`);
      } finally {
        setUploadingSlot(null);
      }
    }
  };

  const removePhoto = (slotKey) => {
    setPhotos((prev) => {
      const updated = { ...prev };
      delete updated[slotKey];
      return updated;
    });
  };

  const toggleChecklistItem = (item) => {
    if (checklist.includes(item)) {
      setChecklist(checklist.filter((i) => i !== item));
    } else {
      setChecklist([...checklist, item]);
    }
  };

  const calculateDistance = () => {
    if (!isCheckIn && booking.startOdometer && odometer) {
      const end = parseInt(odometer, 10);
      const start = booking.startOdometer;
      return Math.max(0, end - start);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!odometer) {
      setErrorMsg('Please enter the odometer reading.');
      setCurrentStep(1);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // Gather uploaded photo URLs
      const uploadedPhotoUrls = Object.values(photos)
        .map((p) => p.uploadedUrl)
        .filter(Boolean);

      let finalNotes = notes;
      if (checklist.length > 0) {
        finalNotes = `[Handover Checklist: ${checklist.join(', ')}] ${finalNotes}`.trim();
      }

      const payload = {
        odometer: parseInt(odometer, 10),
        fuelLevel,
        notes: finalNotes,
        photos: uploadedPhotoUrls,
        hasDamageReported: hasDamageReported,
        damageDescription: hasDamageReported ? `[Severity: ${damageSeverity}] ${damageDescription}` : null
      };

      if (isCheckIn) {
        await bookingService.checkIn(booking.id, payload);
      } else {
        await bookingService.returnCar(booking.id, payload);
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Inspection submit failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit inspection report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1200, padding: '1rem' }}>
      <div
        className="modal-content animate-slide-up"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
          background: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.85rem',
            marginBottom: '1rem'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: isCheckIn
                  ? 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)'
                  : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}
            >
              <Car size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFF' }}>
                {isCheckIn ? 'Pre-Trip Check-In Inspection' : 'Post-Trip Return Inspection'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Booking #{booking.id.slice(-6).toUpperCase()} • Capture condition before handover
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div className="flex items-center justify-between gap-2" style={{ marginBottom: '1.25rem' }}>
          {[
            { num: 1, title: 'Readings' },
            { num: 2, title: '6-Angle Photos' },
            { num: 3, title: 'Damage & Notes' }
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className="flex items-center gap-2"
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: currentStep === s.num ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: currentStep === s.num ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.06)',
                color: currentStep === s.num ? '#60A5FA' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'left'
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: currentStep === s.num ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem'
                }}
              >
                {s.num}
              </span>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div
            className="flex items-center gap-2 animate-fade-in"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              marginBottom: '1rem'
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP CONTENT (SCROLLABLE) */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '1.25rem' }}>
          {/* ================= STEP 1: READINGS ================= */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.06)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div className="flex items-center gap-1.5" style={{ color: '#60A5FA', fontWeight: 600, marginBottom: '2px' }}>
                  <Info size={14} />
                  <span>Handover Mileage & Fuel Policy</span>
                </div>
                <span>
                  {isCheckIn
                    ? 'Verify the current dashboard odometer reading with the keys handover.'
                    : `Check-In starting odometer was ${booking.startOdometer || 0} km. Enter final reading to record mileage.`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Odometer */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label flex items-center gap-1">
                    <Gauge size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>{isCheckIn ? 'Starting Odometer (KM) *' : 'Return Odometer (KM) *'}</span>
                  </label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    placeholder="e.g. 24500"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                  />
                  {!isCheckIn && booking.startOdometer && odometer && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--accent-emerald)',
                        marginTop: '4px',
                        fontWeight: 700,
                        display: 'block'
                      }}
                    >
                      Trip Distance Driven: {calculateDistance()} KM
                    </span>
                  )}
                </div>

                {/* Fuel Level */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label flex items-center gap-1">
                    <Fuel size={14} style={{ color: 'var(--accent-emerald)' }} />
                    <span>Fuel Tank Level (%) *</span>
                  </label>
                  <select
                    className="form-select"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(e.target.value)}
                  >
                    <option value="100%">100% (Full Tank)</option>
                    <option value="75%">75% (3/4 Tank)</option>
                    <option value="50%">50% (Half Tank)</option>
                    <option value="25%">25% (Quarter Tank)</option>
                    <option value="Empty">Near Empty</option>
                  </select>
                </div>
              </div>

              {/* Quick Handover Verification Checklist */}
              <div style={{ marginTop: '0.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Handover Verification Checklist
                </label>
                <div className="flex flex-col gap-2">
                  {PRE_CHECKLIST.map((item) => {
                    const checked = checklist.includes(item);
                    return (
                      <div
                        key={item}
                        onClick={() => toggleChecklistItem(item)}
                        className="flex items-center gap-2.5"
                        style={{
                          background: checked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: checked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                          padding: '0.6rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 150ms ease'
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            background: checked ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            flexShrink: 0
                          }}
                        >
                          {checked && <Check size={12} />}
                        </div>
                        <span style={{ fontSize: '0.82rem', color: checked ? '#6EE7B7' : 'var(--text-secondary)' }}>
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: 6-ANGLE PHOTOS ================= */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#FFF' }}>
                    Guided 360° Photo Inspection
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Capture high-resolution photos for each angle to document vehicle exterior and interior state.
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  {Object.keys(photos).length} / {PHOTO_SLOTS.length} Uploaded
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PHOTO_SLOTS.map((slot) => {
                  const hasPhoto = !!photos[slot.key];
                  const isUploading = uploadingSlot === slot.key;

                  return (
                    <div
                      key={slot.key}
                      style={{
                        background: 'var(--bg-surface-raised)',
                        border: hasPhoto ? '1px solid var(--accent-emerald)' : '1px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '160px'
                      }}
                    >
                      {hasPhoto ? (
                        <>
                          <img
                            src={photos[slot.key].previewUrl}
                            alt={slot.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              display: 'flex',
                              gap: '4px'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => removePhoto(slot.key)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '3px 6px', borderRadius: '4px' }}
                              title="Delete photo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(15, 23, 42, 0.85)',
                              backdropFilter: 'blur(4px)',
                              padding: '3px 6px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: '#6EE7B7',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle2 size={11} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {slot.label}
                            </span>
                          </div>
                        </>
                      ) : (
                        <label
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            padding: '0.75rem',
                            textAlign: 'center'
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            disabled={isUploading}
                            onChange={(e) => handlePhotoSelect(slot.key, e)}
                            style={{ display: 'none' }}
                          />
                          {isUploading ? (
                            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
                          ) : (
                            <Camera size={22} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
                          )}
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFF' }}>
                            {slot.label}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {slot.hint}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 3: DAMAGE & NOTES ================= */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Return Mode: Damage Alert Flag Toggle */}
              {!isCheckIn && (
                <div
                  style={{
                    background: hasDamageReported ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: hasDamageReported ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem'
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: hasDamageReported ? '0.75rem' : 0 }}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} style={{ color: hasDamageReported ? '#EF4444' : 'var(--text-muted)' }} />
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: hasDamageReported ? '#FCA5A5' : '#FFF' }}>
                          Report New Vehicle Damage?
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          Toggle this on if new scratches, dents, or broken components were incurred during the rental.
                        </span>
                      </div>
                    </div>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasDamageReported}
                        onChange={(e) => setHasDamageReported(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </label>
                  </div>

                  {hasDamageReported && (
                    <div className="flex flex-col gap-3 animate-fade-in" style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '0.75rem' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Damage Severity</label>
                        <div className="flex gap-2">
                          {['LOW', 'MEDIUM', 'HIGH'].map((sev) => (
                            <button
                              key={sev}
                              type="button"
                              onClick={() => setDamageSeverity(sev)}
                              className={`btn btn-sm ${damageSeverity === sev ? 'btn-danger' : 'btn-secondary'}`}
                              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem' }}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Detailed Damage Description *</label>
                        <textarea
                          rows={2}
                          required={hasDamageReported}
                          className="form-textarea"
                          placeholder="Describe the exact location and nature of damage (e.g. 5-inch scratch on left passenger door, cracked tail light)..."
                          value={damageDescription}
                          onChange={(e) => setDamageDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* General Inspection Notes */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  {isCheckIn ? 'Pre-Trip Inspection Notes & Observations' : 'Return Handover Notes'}
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="e.g. Existing scuff on alloy wheel, clean cabin, AC functioning perfectly, Fastag balance confirmed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          className="flex items-center justify-between"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '0.85rem'
          }}
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-secondary btn-sm flex items-center gap-1"
            >
              <ChevronLeft size={15} />
              <span>Back</span>
            </button>
          ) : (
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="btn btn-primary btn-sm flex items-center gap-1"
            >
              <span>Next Step</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              style={{ background: isCheckIn ? undefined : 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting Dossier...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>{isCheckIn ? 'Confirm & Save Check-In' : 'Submit Return Inspection'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleInspectionModal;
