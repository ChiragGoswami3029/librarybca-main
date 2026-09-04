import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, FileText, ArrowRight, CheckCheck } from 'lucide-react';
import { getNotifications, markNotificationRead } from '../services/followApi';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleMarkRead = async (id) => {
    setMarkingId(id);
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silently catch
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    setIsMarkingAll(true);
    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Re-fetch to be accurate
      loadNotifications();
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Notifications
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Updates on newly uploaded notes and assignments for subjects you follow.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="glass"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
            isLoading={isMarkingAll}
          >
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div>
        {isLoading ? (
          <div>
            <Skeleton type="row" height="68px" />
            <Skeleton type="row" height="68px" />
            <Skeleton type="row" height="68px" />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load notifications"
            message={error.message || 'Unable to retrieve notifications.'}
            onRetry={loadNotifications}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When classmates upload resources for subjects you follow, notifications will appear here."
            actionLabel="Follow BCA Subjects"
            onAction={() => navigate('/app/followed-subjects')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((note) => {
              const isUnread = !note.is_read;
              const isBusy = markingId === note.id;

              return (
                <div
                  key={note.id}
                  className="glass-card"
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    background: isUnread
                      ? 'linear-gradient(135deg, var(--surface-glass-strong) 0%, rgba(102, 155, 188, 0.15) 100%)'
                      : 'var(--surface-card)',
                    border: isUnread ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-full)',
                        background: isUnread ? 'var(--accent-subtle)' : 'var(--surface-glass-subtle)',
                        color: isUnread ? 'var(--accent-primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bell size={18} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: isUnread ? 700 : 500,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          marginBottom: '0.2rem',
                        }}
                      >
                        {note.message}
                      </p>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={12} />
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {note.file_id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/app/files/${note.file_id}`)}
                        className="btn btn-glass btn-sm"
                      >
                        <span>View Resource</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(note.id)}
                        disabled={isBusy}
                        className="btn btn-ghost btn-sm"
                        title="Mark as read"
                      >
                        <CheckCircle2 size={15} style={{ color: 'var(--accent-primary)' }} />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
