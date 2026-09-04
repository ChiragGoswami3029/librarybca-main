import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading data.',
  onRetry = null,
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        border: '1px solid var(--color-danger)',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-danger-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger)',
        }}
      >
        <AlertTriangle size={26} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', maxWidth: 400, margin: '0 auto', color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <Button variant="glass" size="sm" icon={RotateCcw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
