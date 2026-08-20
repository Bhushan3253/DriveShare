import React from 'react';
import { Smartphone, QrCode } from 'lucide-react';

const AppDownloadQR = ({ size = 180 }) => {
  return (
    <div
      style={{
        background: '#FFFFFF',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          style={{ display: 'block', shapeRendering: 'crispEdges' }}
        >
          {/* Background */}
          <rect width="100" height="100" fill="#FFFFFF" />

          {/* Top-Left Finder Pattern */}
          <rect x="5" y="5" width="28" height="28" fill="#0F172A" rx="4" />
          <rect x="9" y="9" width="20" height="20" fill="#FFFFFF" rx="2" />
          <rect x="13" y="13" width="12" height="12" fill="#2563EB" rx="2" />

          {/* Top-Right Finder Pattern */}
          <rect x="67" y="5" width="28" height="28" fill="#0F172A" rx="4" />
          <rect x="71" y="9" width="20" height="20" fill="#FFFFFF" rx="2" />
          <rect x="75" y="13" width="12" height="12" fill="#2563EB" rx="2" />

          {/* Bottom-Left Finder Pattern */}
          <rect x="5" y="67" width="28" height="28" fill="#0F172A" rx="4" />
          <rect x="9" y="71" width="20" height="20" fill="#FFFFFF" rx="2" />
          <rect x="13" y="75" width="12" height="12" fill="#2563EB" rx="2" />

          {/* Alignment Patterns & Data Blocks */}
          <rect x="38" y="8" width="5" height="5" fill="#0F172A" />
          <rect x="47" y="8" width="5" height="5" fill="#0F172A" />
          <rect x="56" y="8" width="5" height="5" fill="#0F172A" />

          <rect x="38" y="18" width="5" height="5" fill="#2563EB" />
          <rect x="47" y="18" width="5" height="5" fill="#0F172A" />
          <rect x="56" y="18" width="5" height="5" fill="#0F172A" />

          <rect x="38" y="28" width="5" height="5" fill="#0F172A" />
          <rect x="47" y="28" width="5" height="5" fill="#2563EB" />
          <rect x="56" y="28" width="5" height="5" fill="#0F172A" />

          <rect x="8" y="38" width="5" height="5" fill="#0F172A" />
          <rect x="18" y="38" width="5" height="5" fill="#0F172A" />
          <rect x="28" y="38" width="5" height="5" fill="#2563EB" />
          <rect x="38" y="38" width="5" height="5" fill="#0F172A" />
          <rect x="47" y="38" width="5" height="5" fill="#0F172A" />
          <rect x="56" y="38" width="5" height="5" fill="#2563EB" />
          <rect x="67" y="38" width="5" height="5" fill="#0F172A" />
          <rect x="76" y="38" width="5" height="5" fill="#0F172A" />
          <rect x="86" y="38" width="5" height="5" fill="#2563EB" />

          <rect x="8" y="47" width="5" height="5" fill="#2563EB" />
          <rect x="18" y="47" width="5" height="5" fill="#0F172A" />
          <rect x="28" y="47" width="5" height="5" fill="#0F172A" />
          <rect x="38" y="47" width="5" height="5" fill="#2563EB" />
          <rect x="56" y="47" width="5" height="5" fill="#0F172A" />
          <rect x="67" y="47" width="5" height="5" fill="#2563EB" />
          <rect x="76" y="47" width="5" height="5" fill="#0F172A" />
          <rect x="86" y="47" width="5" height="5" fill="#0F172A" />

          <rect x="8" y="56" width="5" height="5" fill="#0F172A" />
          <rect x="18" y="56" width="5" height="5" fill="#2563EB" />
          <rect x="28" y="56" width="5" height="5" fill="#0F172A" />
          <rect x="38" y="56" width="5" height="5" fill="#0F172A" />
          <rect x="47" y="56" width="5" height="5" fill="#2563EB" />
          <rect x="56" y="56" width="5" height="5" fill="#0F172A" />
          <rect x="67" y="56" width="5" height="5" fill="#0F172A" />
          <rect x="76" y="56" width="5" height="5" fill="#2563EB" />
          <rect x="86" y="56" width="5" height="5" fill="#0F172A" />

          <rect x="38" y="67" width="5" height="5" fill="#0F172A" />
          <rect x="47" y="67" width="5" height="5" fill="#0F172A" />
          <rect x="56" y="67" width="5" height="5" fill="#2563EB" />
          <rect x="67" y="67" width="5" height="5" fill="#0F172A" />
          <rect x="76" y="67" width="5" height="5" fill="#0F172A" />
          <rect x="86" y="67" width="5" height="5" fill="#0F172A" />

          <rect x="38" y="76" width="5" height="5" fill="#2563EB" />
          <rect x="47" y="76" width="5" height="5" fill="#0F172A" />
          <rect x="56" y="76" width="5" height="5" fill="#0F172A" />
          <rect x="67" y="76" width="5" height="5" fill="#2563EB" />
          <rect x="76" y="76" width="5" height="5" fill="#0F172A" />
          <rect x="86" y="76" width="5" height="5" fill="#2563EB" />

          <rect x="38" y="86" width="5" height="5" fill="#0F172A" />
          <rect x="47" y="86" width="5" height="5" fill="#2563EB" />
          <rect x="56" y="86" width="5" height="5" fill="#0F172A" />
          <rect x="67" y="86" width="5" height="5" fill="#0F172A" />
          <rect x="76" y="86" width="5" height="5" fill="#2563EB" />
          <rect x="86" y="86" width="5" height="5" fill="#0F172A" />

          {/* Center Brand Badge */}
          <rect x="40" y="40" width="20" height="20" fill="#FFFFFF" rx="4" />
          <rect x="42" y="42" width="16" height="16" fill="#2563EB" rx="3" />
        </svg>

        {/* Center Icon */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <Smartphone size={size > 140 ? 16 : 12} />
        </div>
      </div>

      <div
        style={{
          marginTop: '0.65rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#0F172A',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <QrCode size={13} style={{ color: '#2563EB' }} />
        <span>Scan to Download</span>
      </div>
    </div>
  );
};

export default AppDownloadQR;
