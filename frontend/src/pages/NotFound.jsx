import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass-subtle)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
        }}
      >
        <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
        <h2 style={{ margin: '0.75rem 0 0.5rem' }}>Page not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The page you requested does not exist or may have moved.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
