import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Bell, Menu, User, ChevronDown, LogIn, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/followApi';

export default function Topbar({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Focus search input on '/' shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync search input if currently on browse page with query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Fetch unread notifications count if logged in
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
  }, [isAuthenticated, location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/app/browse');
    }
  };

  return (
    <header
      className="topbar"
      style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'transparent',
      }}
    >
      {/* Left Area: Mobile Menu Toggle & Global Search Capsule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 480px', maxWidth: '520px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn btn-ghost mobile-menu-btn"
          aria-label="Toggle navigation menu"
          style={{ padding: '8px' }}
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
          }}
          role="search"
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search notes, subjects or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
            style={{
              paddingLeft: '38px',
              paddingRight: '36px',
              height: '42px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-glass)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-glass-sm)',
            }}
            aria-label="Search notes, subjects or people"
          />
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            <span className="kbd-shortcut">/</span>
          </div>
        </form>
      </div>

      {/* Right Area: Theme Toggle, Notifications, User Avatar Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Theme Toggle Pill */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            width: '46px',
            height: '28px',
            borderRadius: '9999px',
            background: 'var(--surface-glass)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-glass-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px 4px',
            transition: 'all var(--transition-fast)',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: theme === 'dark' ? '#011420' : '#8C5535',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: theme === 'dark' ? 'translateX(16px)' : 'translateX(0)',
              transition: 'transform var(--transition-fast)',
            }}
          >
            {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
          </div>
        </button>

        {/* Notification Bell with Badge Count */}
        <button
          type="button"
          onClick={() => navigate('/app/notifications')}
          aria-label="Notifications"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--surface-glass)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-glass-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            position: 'relative',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '17px',
                height: '17px',
                borderRadius: '9999px',
                background: '#8C5535',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid var(--bg-main)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Authenticated User Chip with Dropdown */}
        {isAuthenticated ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {/* User Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8C5535 0%, #A26842 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(140, 85, 53, 0.3)',
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
              </div>

              {/* Name & Academic Info */}
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.15 }}>
                  {user?.name || 'Student'}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.15, marginTop: '2px' }}>
                  BCA 3rd Sem
                </p>
              </div>

              <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
            </button>

            {/* User Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-glass)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/app/profile');
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.825rem', padding: '8px 12px' }}
                >
                  <User size={15} />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/app/settings');
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.825rem', padding: '8px 12px' }}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>
                <div style={{ height: '1px', background: 'var(--border-glass-subtle)', margin: '4px 0' }} />
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.825rem', padding: '8px 12px', color: 'var(--color-danger)' }}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '7px 16px' }}
          >
            <LogIn size={14} />
            <span>Log in</span>
          </button>
        )}
      </div>
    </header>
  );
}
