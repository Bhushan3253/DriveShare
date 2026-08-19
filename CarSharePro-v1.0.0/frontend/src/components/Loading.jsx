import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = 'Loading...', fullScreen = false, size = 36 }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2
        size={size}
        className="animate-pulse"
        style={{
          color: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }}
      />
      {message && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh', width: '100%' }}>
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
