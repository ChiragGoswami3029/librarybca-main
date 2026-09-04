import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  UploadCloud,
  FolderHeart,
  Bell,
  BookmarkCheck,
  User,
  Settings,
  GraduationCap,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/followApi';

export default function Sidebar({ isOpen, onClose }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    let isMounted = true;
    getNotifications()
      .then((items) => {
        if (isMounted && Array.isArray(items)) {
          const unread = items.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Browse', path: '/app/browse', icon: Compass },
    { label: 'Upload', path: '/app/upload', icon: UploadCloud, requiresAuth: true },
    { label: 'My Uploads', path: '/app/my-uploads', icon: FolderHeart, requiresAuth: true },
    { label: 'Notifications', path: '/app/notifications', icon: Bell, requiresAuth: true, badge: unreadCount },
    { label: 'Followed Subjects', path: '/app/followed-subjects', icon: BookmarkCheck, requiresAuth: true },
    { label: 'Profile', path: '/app/profile', icon: User, requiresAuth: true },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 8, 7, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
          }}
          onClick={onClose}
          className="mobile-backdrop"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          borderRadius: 0,
          borderRight: '1px solid var(--sidebar-border)',
          background: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem 1.4rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8C5535 0%, #A26842 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(140, 85, 53, 0.4)',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', lineHeight: 1.2 }}>
              AcademicShare
            </h1>
            <p style={{ fontSize: '0.725rem', color: 'var(--sidebar-text-muted)', marginTop: '2px' }}>
              Share. Learn. Grow.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            padding: '0.75rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 14px',
                  borderRadius: '12px',
                  color: isActive ? 'var(--sidebar-nav-active-text)' : 'var(--sidebar-text-muted)',
                  background: isActive ? 'var(--sidebar-nav-active-bg)' : 'transparent',
                  border: isActive ? '1px solid var(--sidebar-nav-active-border)' : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                  boxShadow: isActive ? '0 4px 14px rgba(140, 85, 53, 0.25)' : 'none',
                })}
              >
                <Icon size={18} style={{ opacity: 0.9, flexShrink: 0 }} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="nav-badge-pill">{item.badge}</span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Promotional Card */}
        <div style={{ padding: '0 1rem 1.25rem' }}>
          <div
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '16px',
              background: 'var(--sidebar-promo-bg)',
              border: '1px solid var(--sidebar-promo-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.75rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* 3D-styled Academic Illustration */}
            <div
              style={{
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stack of books with mortarboard & plant */}
                <ellipse cx="32" cy="56" rx="24" ry="4" fill="rgba(0,0,0,0.2)" />
                {/* Book 1 (Bottom) */}
                <path d="M14 46L32 52L50 46L32 40L14 46Z" fill="#C49B7B" />
                <path d="M14 46L32 52V56L14 50V46Z" fill="#8C5535" />
                <path d="M50 46L32 52V56L50 50V46Z" fill="#A86E49" />
                {/* Book 2 (Middle) */}
                <path d="M16 40L32 45L48 40L32 35L16 40Z" fill="#D8B598" />
                <path d="M16 40L32 45V48L16 43V40Z" fill="#9E6742" />
                <path d="M48 40L32 45V48L48 43V40Z" fill="#BD845C" />
                {/* Book 3 (Top) */}
                <path d="M18 34L32 39L46 34L32 29L18 34Z" fill="#E8D1BC" />
                <path d="M18 34L32 39V42L18 37V34Z" fill="#A86E49" />
                <path d="M46 34L32 39V42L46 37V34Z" fill="#C9946E" />
                {/* Graduation Cap */}
                <path d="M32 16L48 22L32 28L16 22L32 16Z" fill="#FFFFFF" opacity="0.95" />
                <path d="M24 25V30C24 33 32 35 32 35C32 35 40 33 40 30V25" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.9" />
                <path d="M45 23V31" stroke="#D8B598" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="45" cy="32" r="1.5" fill="#D8B598" />
              </svg>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
                Share knowledge,
                <br />
                grow together.
              </h4>
              <p style={{ fontSize: '0.725rem', color: 'var(--sidebar-text-muted)', marginTop: '4px', lineHeight: 1.35 }}>
                Upload your notes and help
                <br />
                your classmates succeed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(isAuthenticated ? '/app/upload' : '/login')}
              className="btn"
              style={{
                width: '100%',
                padding: '7px 12px',
                fontSize: '0.775rem',
                fontWeight: 700,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8C5535 0%, #A26842 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(235, 175, 130, 0.3)',
                boxShadow: '0 4px 12px rgba(140, 85, 53, 0.35)',
                gap: '6px',
              }}
            >
              <Upload size={14} />
              <span>Upload Now</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
