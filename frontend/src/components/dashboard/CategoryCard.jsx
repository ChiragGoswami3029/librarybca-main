import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ClipboardList, HelpCircle, FileClock } from 'lucide-react';

const categoryConfig = {
  'Notes': {
    icon: FileText,
    subtitle: 'Lecture & Class Notes',
    bg: '#8C5535',
  },
  'Assignments': {
    icon: ClipboardList,
    subtitle: 'Lab Problems & Tasks',
    bg: '#985E39',
  },
  'Important Questions': {
    icon: HelpCircle,
    subtitle: 'Exam Banks & Viva',
    bg: '#A4663E',
  },
  'Previous Year Papers': {
    icon: FileClock,
    subtitle: 'Past Semester Papers',
    bg: '#8C5535',
  },
};

export default function CategoryCard({ category }) {
  const navigate = useNavigate();
  const config = categoryConfig[category] || {
    icon: FileText,
    subtitle: 'Browse Materials',
    bg: '#8C5535',
  };
  const IconComponent = config.icon;

  return (
    <div
      className="glass-card glass-card-interactive"
      onClick={() => navigate(`/app/browse?category=${encodeURIComponent(category)}`)}
      style={{
        padding: '1.4rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderRadius: '20px',
        minHeight: '145px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-glass-sm)',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Category Caramel Icon Box */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8C5535 0%, #A26842 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(140, 85, 53, 0.3)',
          marginBottom: '1rem',
        }}
      >
        <IconComponent size={22} />
      </div>

      <div>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            marginBottom: '0.25rem',
          }}
        >
          {category}
        </h3>
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {config.subtitle}
        </p>
      </div>
    </div>
  );
}
