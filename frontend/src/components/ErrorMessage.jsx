import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry, title = 'Error' }) => {
  return (
    <div
      className="card flex items-start gap-4"
      style={{
        background: 'var(--accent-rose-light)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#FCA5A5',
        margin: '1.5rem 0'
      }}
    >
      <AlertCircle size={24} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
      <div className="flex-1">
        {title && <h4 style={{ color: '#F87171', fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</h4>}
        <p style={{ fontSize: '0.9rem', color: '#FECACA' }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-secondary btn-sm flex items-center gap-2"
            style={{
              marginTop: '0.75rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#FFFFFF'
            }}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
