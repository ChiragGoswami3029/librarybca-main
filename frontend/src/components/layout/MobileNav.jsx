import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, UploadCloud, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { isAuthenticated } = useAuth();

  const items = [
    { label: 'Home', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Browse', path: '/app/browse', icon: Compass },
    { label: 'Upload', path: '/app/upload', icon: UploadCloud, requiresAuth: true },
    { label: 'Alerts', path: '/app/notifications', icon: Bell, requiresAuth: true },
    { label: 'Profile', path: isAuthenticated ? '/app/profile' : '/login', icon: User },
  ];

  return (
    <nav
      className="mobile-nav glass-panel-strong"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'none', // Controlled via CSS media query
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 80,
        borderRadius: 0,
        borderBottom: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: '1px solid var(--border-glass)',
        padding: '0 0.5rem',
        background: 'var(--surface-modal)',
      }}
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            })}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
