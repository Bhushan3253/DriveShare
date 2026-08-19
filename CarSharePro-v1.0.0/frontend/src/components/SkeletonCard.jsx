import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      {/* Top Image area */}
      <div className="skeleton" style={{ width: '100%', height: '190px' }} />

      {/* Content area */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {/* Title */}
        <div className="flex justify-between items-center">
          <div className="skeleton" style={{ width: '60%', height: '22px' }} />
          <div className="skeleton" style={{ width: '45px', height: '20px' }} />
        </div>

        {/* Specs Pills */}
        <div className="flex gap-2">
          <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: 'var(--radius-sm)' }} />
        </div>

        {/* Price & CTA */}
        <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="skeleton" style={{ width: '80px', height: '24px' }} />
          <div className="skeleton" style={{ width: '75px', height: '32px', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
