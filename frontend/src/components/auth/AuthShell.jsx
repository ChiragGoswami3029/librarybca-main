import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, BookOpen, Users, ShieldCheck } from 'lucide-react';

export default function AuthShell({ children, title, subtitle }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Floating Bubbles */}
      <div className="auth-bubble auth-bubble-1" />
      <div className="auth-bubble auth-bubble-2" />

      <div
        className="glass-panel-strong animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          overflow: 'hidden',
          zIndex: 10,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Left / Brand Visual Panel */}
        <div
          style={{
            padding: '3rem 2.5rem',
            background: 'var(--auth-brand-bg)',
            borderRight: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '2.5rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #669BBC 0%, #0a4066 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(102, 155, 188, 0.35)',
                }}
              >
                <GraduationCap size={24} />
              </div>
              <div>
                <span className="auth-hero-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--auth-hero-text)' }}>
                  Academic<span style={{ color: 'var(--accent-primary)' }}>Share</span>
                </span>
                <p className="auth-hero-text" style={{ fontSize: '0.75rem', color: 'var(--auth-hero-text-muted)' }}>BCA Student Material Exchange</p>
              </div>
            </Link>

            <h2 className="auth-hero-text" style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem', color: 'var(--auth-hero-text)' }}>
              Study together, score better.
            </h2>
            <p className="auth-hero-text" style={{ fontSize: '0.9rem', color: 'var(--auth-hero-text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Connect with your BCA classmates to access lecture notes, previous exam papers, solved practicals, and assignment solutions.
            </p>

            {/* Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={16} />
                </div>
                <span className="auth-hero-text" style={{ fontSize: '0.85rem', color: 'var(--auth-hero-text)', fontWeight: 500 }}>
                  Structured by semester & BCA subject
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={16} />
                </div>
                <span className="auth-hero-text" style={{ fontSize: '0.85rem', color: 'var(--auth-hero-text)', fontWeight: 500 }}>
                  Ask questions & discuss on any document
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={16} />
                </div>
                <span className="auth-hero-text" style={{ fontSize: '0.85rem', color: 'var(--auth-hero-text)', fontWeight: 500 }}>
                  Instant subject follow notifications
                </span>
              </div>
            </div>
          </div>

          <div className="auth-hero-text" style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--auth-hero-text-muted)' }}>
            &copy; {new Date().getFullYear()} AcademicShare. Built for BCA students.
          </div>
        </div>

        {/* Right / Form Area */}
        <div
          style={{
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'var(--surface-modal)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.35rem' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
