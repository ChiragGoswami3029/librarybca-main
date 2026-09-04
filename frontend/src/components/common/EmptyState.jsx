import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no items matching your criteria yet.',
  actionLabel = null,
  onAction = null,
  actionIcon = null,
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)',
        }}
      >
        <Icon size={28} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', maxWidth: 360, margin: '0 auto' }}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
