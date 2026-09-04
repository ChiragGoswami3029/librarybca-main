import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../../services/followApi';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../common/Skeleton';

// Status dot colors matching reference
const dotColors = ['#8C5535', '#22C55E', '#EA580C', '#3B82F6', '#A855F7'];

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadNotifications = () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    getNotifications()
      .then((data) => {
        setNotifications(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch(() => {
        setNotifications([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, [isAuthenticated]);

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'recently';
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.4rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-glass)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Notifications
        </h3>
        <Link
          to={isAuthenticated ? '/app/notifications' : '/login'}
          style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          View all
        </Link>
      </div>

      {!isAuthenticated ? (
        <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Log in to see updates for your followed subjects.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn btn-glass btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            Log in
          </button>
        </div>
      ) : isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height="54px" />
          <Skeleton height="54px" />
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: '1rem 0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            You're all caught up.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((note, index) => {
            const dotColor = dotColors[index % dotColors.length];
            return (
              <div
                key={note.id}
                onClick={() => note.file_id && navigate(`/app/files/${note.file_id}`)}
                className="glass-card-interactive"
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: note.is_read ? 'var(--surface-glass-subtle)' : 'var(--surface-card)',
                  border: note.is_read ? '1px solid var(--border-glass-subtle)' : '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: note.file_id ? 'pointer' : 'default',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Colored Status Dot */}
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: dotColor,
                    marginTop: '5px',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1.25,
                      marginBottom: '2px',
                    }}
                  >
                    {note.message}
                  </p>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginTop: '2px',
                    }}
                  >
                    {formatRelativeTime(note.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
