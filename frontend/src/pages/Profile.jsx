import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Calendar, FolderHeart, BookmarkCheck, LogOut, ArrowRight, Shield } from 'lucide-react';
import { getProfile } from '../services/authApi';
import { getMyFiles } from '../services/filesApi';
import { getMyFollows } from '../services/followApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';

export default function Profile() {
  const { user: contextUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [uploadsCount, setUploadsCount] = useState(0);
  const [followsCount, setFollowsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prof, files, follows] = await Promise.all([
        getProfile(),
        getMyFiles().catch(() => []),
        getMyFollows().catch(() => []),
      ]);

      setProfile(prof);
      if (Array.isArray(files)) setUploadsCount(files.length);
      if (Array.isArray(follows)) setFollowsCount(follows.length);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height="140px" />
        <Skeleton height="200px" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <ErrorState
          title="Could not load profile"
          message={error?.message || 'Unable to retrieve user profile data.'}
          onRetry={loadProfileData}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Student Profile
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Your verified account information and sharing activity.
        </p>
      </div>

      {/* User Header Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #669BBC 0%, #0a4066 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 6px 20px rgba(102, 155, 188, 0.4)',
              flexShrink: 0,
            }}
          >
            {profile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div style={{ minWidth: '240px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile.name}</h2>
              <span className="badge badge-accent">BCA Student</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
                {profile.email}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
                Member since {formatDate(profile.created_at)}
              </span>
            </div>
          </div>

          <div>
            <Button
              variant="glass"
              size="sm"
              icon={LogOut}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Uploads Card */}
        <div
          className="glass-panel glass-card-interactive"
          onClick={() => navigate('/app/my-uploads')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderHeart size={22} />
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {uploadsCount}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Files Uploaded</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Followed Subjects Card */}
        <div
          className="glass-panel glass-card-interactive"
          onClick={() => navigate('/app/followed-subjects')}
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookmarkCheck size={22} />
            </div>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {followsCount}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Followed Subjects</p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Account Info Details */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>Account Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-glass-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>User ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{profile.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-glass-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Full Name</span>
            <span style={{ fontWeight: 600 }}>{profile.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-glass-subtle)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Registered Email</span>
            <span style={{ fontWeight: 600 }}>{profile.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Account Status</span>
            <span className="badge badge-success">Active & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
