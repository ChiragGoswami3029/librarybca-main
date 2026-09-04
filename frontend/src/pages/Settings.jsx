import React from 'react';
import { Sun, Moon, Monitor, LogOut, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, setTheme, isDark } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          App Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your interface appearance and application preferences.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          Appearance & Theme
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Select your preferred viewing mode. Your preference is saved locally and applies across sessions.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Dark Mode Card */}
          <div
            className="glass-card-interactive"
            onClick={() => setTheme('dark')}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: isDark ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
              background: isDark ? 'var(--accent-subtle)' : 'var(--surface-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: '#011420',
                  color: '#669BBC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #669BBC',
                }}
              >
                <Moon size={18} />
              </div>
              {isDark && <Check size={18} style={{ color: 'var(--accent-primary)' }} />}
            </div>

            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Dark Navy (Finalized)</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Rich #011420 background with #669BBC frosted glass accents.
              </p>
            </div>
          </div>

          {/* Light Mode Card */}
          <div
            className="glass-card-interactive"
            onClick={() => setTheme('light')}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: !isDark ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
              background: !isDark ? 'var(--accent-subtle)' : 'var(--surface-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: '#f4f8fb',
                  color: '#0a2538',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #669BBC',
                }}
              >
                <Sun size={18} />
              </div>
              {!isDark && <Check size={18} style={{ color: 'var(--accent-primary)' }} />}
            </div>

            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Bright Glass (Finalized)</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Crisp translucent light surfaces with #669BBC highlights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      {isAuthenticated && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Account Session
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Signed in as <strong>{user?.name}</strong> ({user?.email || 'Student'}).
          </p>

          <Button
            variant="glass"
            size="md"
            icon={LogOut}
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log Out from this Device
          </Button>
        </div>
      )}
    </div>
  );
}
