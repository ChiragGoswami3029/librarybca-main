import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Plus, Loader2 } from 'lucide-react';
import { getMyFollows, unfollowSubject, followSubject } from '../../services/followApi';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../common/Skeleton';

// Distinct accent dot colors for subjects matching screenshot
const subjectColors = [
  '#8C5535', // Brown
  '#EAB308', // Amber / Gold
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#EC4899', // Pink
];

export default function FollowedSubjects() {
  const [follows, setFollows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setIsLoading(true);
    getMyFollows()
      .then((data) => {
        if (isMounted) {
          setFollows(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) setFollows([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleToggleFollow = async (e, subject) => {
    e.preventDefault();
    e.stopPropagation();
    setActionLoading((prev) => ({ ...prev, [subject]: true }));
    try {
      await unfollowSubject(subject);
      setFollows((prev) => prev.filter((s) => s !== subject));
    } catch {
      // Silently handle
    } finally {
      setActionLoading((prev) => ({ ...prev, [subject]: false }));
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
          Followed Subjects
        </h3>
        <Link
          to={isAuthenticated ? '/app/followed-subjects' : '/login'}
          style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
        >
          Manage
        </Link>
      </div>

      {!isAuthenticated ? (
        <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Follow subjects to receive notifications on new uploads.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn btn-glass btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            Log in to Follow
          </button>
        </div>
      ) : isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </div>
      ) : follows.length === 0 ? (
        <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Follow subjects to receive updates.
          </p>
          <button
            type="button"
            onClick={() => navigate('/app/followed-subjects')}
            className="btn btn-glass btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            <Plus size={14} />
            <span>Follow Subjects</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {follows.slice(0, 6).map((subject, index) => {
            const dotColor = subjectColors[index % subjectColors.length];
            const isBusy = Boolean(actionLoading[subject]);

            return (
              <div
                key={subject}
                className="glass-card-interactive"
                onClick={() => navigate(`/app/browse?subject=${encodeURIComponent(subject)}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '12px',
                  background: 'var(--surface-glass-subtle)',
                  border: '1px solid var(--border-glass-subtle)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span className="truncate" style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                    {subject}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleToggleFollow(e, subject)}
                  disabled={isBusy}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Unfollow subject"
                  aria-label={`Unfollow ${subject}`}
                >
                  {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Bell size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
