import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function QuickUpload() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.4rem',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-glass)',
      }}
    >
      {/* Top row: Caramel Upload Icon Box + Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #8C5535 0%, #A26842 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(140, 85, 53, 0.35)',
            flexShrink: 0,
          }}
        >
          <UploadCloud size={24} />
        </div>

        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Quick Upload
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
            Share your notes with
            <br />
            your classmates.
          </p>
        </div>
      </div>

      {/* Button: Upload Files */}
      <button
        type="button"
        onClick={() => navigate(isAuthenticated ? '/app/upload' : '/login')}
        className="btn"
        style={{
          width: '100%',
          padding: '9px 16px',
          fontSize: '0.825rem',
          fontWeight: 700,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8C5535 0%, #A26842 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(235, 175, 130, 0.3)',
          boxShadow: '0 4px 12px rgba(140, 85, 53, 0.3)',
          gap: '8px',
        }}
      >
        <Upload size={15} />
        <span>Upload Files</span>
      </button>
    </div>
  );
}
