import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Plus, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { getMyFollows, followSubject, unfollowSubject } from '../services/followApi';
import { getMeta } from '../services/metaApi';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';

export default function FollowedSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [followedSubjects, setFollowedSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // { [subject]: boolean }
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [metaData, followsData] = await Promise.all([
        getMeta(),
        getMyFollows(),
      ]);

      if (metaData?.subjects && Array.isArray(metaData.subjects)) {
        setSubjects(metaData.subjects);
      }
      if (Array.isArray(followsData)) {
        setFollowedSubjects(followsData);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFollow = async (subject) => {
    const isFollowing = followedSubjects.includes(subject);
    setActionLoading((prev) => ({ ...prev, [subject]: true }));
    setActionError('');

    try {
      if (isFollowing) {
        await unfollowSubject(subject);
        setFollowedSubjects((prev) => prev.filter((s) => s !== subject));
      } else {
        await followSubject(subject);
        setFollowedSubjects((prev) => [...prev, subject]);
      }
    } catch (err) {
      setActionError(err.message || `Failed to update follow for ${subject}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [subject]: false }));
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Followed Subjects
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Follow BCA subjects to receive instant notifications whenever new study material is uploaded.
        </p>
      </div>

      {actionError && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Subject Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
          <Skeleton height="110px" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load subjects"
          message={error.message || 'Unable to retrieve subjects.'}
          onRetry={loadData}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1rem',
          }}
        >
          {subjects.map((subject) => {
            const isFollowing = followedSubjects.includes(subject);
            const isBusy = Boolean(actionLoading[subject]);

            return (
              <div
                key={subject}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  border: isFollowing ? '1px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                  background: isFollowing ? 'linear-gradient(135deg, var(--surface-glass) 0%, rgba(102, 155, 188, 0.1) 100%)' : 'var(--surface-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {subject}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: isFollowing ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {isFollowing ? '✓ Following updates' : 'Not followed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <Link
                    to={`/app/browse?subject=${encodeURIComponent(subject)}`}
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Browse files</span>
                    <ArrowRight size={13} />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(subject)}
                    disabled={isBusy}
                    className={`btn btn-sm ${isFollowing ? 'btn-glass' : 'btn-primary'}`}
                    style={{ minWidth: '96px' }}
                  >
                    {isBusy ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <Check size={13} />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
