import React, { useState } from 'react';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  FileText,
  Gauge,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  X,
  Camera,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Eye,
  ZoomIn
} from 'lucide-react';

const InspectionReportModal = ({ booking, onClose }) => {
  const [activeZoomImg, setActiveZoomImg] = useState(null);

  if (!booking) return null;

  const hasCheckIn = !!booking.checkedInAt || !!booking.startOdometer;
  const hasCheckOut = !!booking.returnedAt || !!booking.endOdometer;
  const checkInPhotos = booking.checkInPhotos || [];
  const checkOutPhotos = booking.checkOutPhotos || [];

  const distanceDriven = booking.totalDistanceDriven !== null && booking.totalDistanceDriven !== undefined
    ? booking.totalDistanceDriven
    : (booking.endOdometer && booking.startOdometer ? Math.max(0, booking.endOdometer - booking.startOdometer) : null);

  return (
    <div className="modal-backdrop" style={{ zIndex: 1200, padding: '1rem' }}>
      <div
        className="modal-content animate-slide-up"
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          background: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF'
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFF' }}>
                Vehicle Inspection & Handover Dossier
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Booking Reference: <strong style={{ color: '#60A5FA' }}>#{booking.id.slice(-6).toUpperCase()}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Report Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Damage Dispute Banner if flagged */}
          {booking.hasDamageReported && (
            <div
              className="flex items-start gap-3 animate-fade-in"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                color: '#FCA5A5'
              }}
            >
              <AlertTriangle size={20} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#EF4444', display: 'block', marginBottom: '2px' }}>
                  ⚠️ Damage Discrepancy Flagged
                </strong>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                  {booking.damageDescription || 'New damage was documented during return inspection. Host & admin review pending.'}
                </p>
              </div>
            </div>
          )}

          {/* 1. KEY HANDOVER METRICS (ODOMETER & FUEL) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Pre-Trip Check-In Card */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div className="flex items-center gap-1.5" style={{ color: '#60A5FA', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={14} />
                <span>Pre-Trip Handover</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                {booking.startOdometer ? `${booking.startOdometer} km` : 'Not recorded'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                Fuel: <strong>{booking.startFuelLevel || '100%'}</strong>
              </span>
              {booking.checkedInAt && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {formatDateTime(booking.checkedInAt)}
                </span>
              )}
            </div>

            {/* Total Distance Driven Card */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Distance Driven
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '2px 0' }}>
                {distanceDriven !== null ? `${distanceDriven} km` : '-'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Recorded via GPS & Odometer
              </span>
            </div>

            {/* Post-Trip Return Card */}
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem'
              }}
            >
              <div className="flex items-center gap-1.5" style={{ color: '#34D399', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <CheckCircle2 size={14} />
                <span>Post-Trip Return</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                {booking.endOdometer ? `${booking.endOdometer} km` : 'Pending Return'}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                Fuel: <strong>{booking.endFuelLevel || '-'}</strong>
              </span>
              {booking.returnedAt && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {formatDateTime(booking.returnedAt)}
                </span>
              )}
            </div>
          </div>

          {/* 2. SIDE-BY-SIDE 360° INSPECTION PHOTO DOSSIER */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={16} style={{ color: 'var(--primary)' }} />
                <span>Visual Inspection Dossier</span>
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click any image to enlarge and inspect details
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Check-in Photos */}
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.03)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem'
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60A5FA', display: 'block', marginBottom: '0.6rem' }}>
                  Pre-Trip Handover Photos ({checkInPhotos.length})
                </span>

                {checkInPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {checkInPhotos.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveZoomImg(url)}
                        style={{
                          height: '80px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        className="card-hover"
                      >
                        <img
                          src={url}
                          alt={`Check-in ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            opacity: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 150ms ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <ZoomIn size={18} style={{ color: '#FFF' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    No check-in photos uploaded
                  </div>
                )}
              </div>

              {/* Return Photos */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.03)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem'
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34D399', display: 'block', marginBottom: '0.6rem' }}>
                  Post-Trip Return Photos ({checkOutPhotos.length})
                </span>

                {checkOutPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {checkOutPhotos.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveZoomImg(url)}
                        style={{
                          height: '80px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        className="card-hover"
                      >
                        <img
                          src={url}
                          alt={`Return ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            opacity: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 150ms ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <ZoomIn size={18} style={{ color: '#FFF' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {hasCheckOut ? 'No return photos uploaded' : 'Pending vehicle return'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. INSPECTION NOTES & OBSERVATIONS */}
          <div className="grid grid-cols-2 gap-4">
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Check-In Observations:
              </span>
              <p style={{ fontSize: '0.85rem', color: '#FFF', margin: 0, fontStyle: booking.checkInNotes ? 'normal' : 'italic' }}>
                {booking.checkInNotes || 'No special notes recorded.'}
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-surface-raised)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Return Handover Notes:
              </span>
              <p style={{ fontSize: '0.85rem', color: '#FFF', margin: 0, fontStyle: booking.checkOutNotes ? 'normal' : 'italic' }}>
                {booking.checkOutNotes || (hasCheckOut ? 'No return notes recorded.' : 'Pending vehicle return handover.')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1rem',
            marginTop: '1rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            DriveShare Certified Digital Handover Dossier
          </span>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close Dossier
          </button>
        </div>

        {/* Image Zoom Lightbox */}
        {activeZoomImg && (
          <div
            className="modal-backdrop animate-fade-in"
            style={{ zIndex: 1300, background: 'rgba(0, 0, 0, 0.92)' }}
            onClick={() => setActiveZoomImg(null)}
          >
            <div
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeZoomImg}
                alt="Enlarged Inspection"
                style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
              />
              <button
                type="button"
                onClick={() => setActiveZoomImg(null)}
                className="btn btn-outline btn-sm"
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: 0,
                  color: '#FFF',
                  borderColor: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%',
                  padding: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionReportModal;
