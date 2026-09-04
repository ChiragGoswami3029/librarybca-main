import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMeta } from '../services/metaApi';
import CategoryCard from '../components/dashboard/CategoryCard';
import FilterBar from '../components/dashboard/FilterBar';
import RecentUploads from '../components/dashboard/RecentUploads';
import NotificationPanel from '../components/dashboard/NotificationPanel';
import FollowedSubjects from '../components/dashboard/FollowedSubjects';
import QuickUpload from '../components/dashboard/QuickUpload';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Dynamic Metadata from GET /meta
  const [meta, setMeta] = useState({
    categories: ['Notes', 'Assignments', 'Important Questions', 'Previous Year Papers'],
    subjects: [],
    semesters: [],
  });

  // Filter Bar state
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    getMeta()
      .then((data) => {
        if (data) {
          setMeta({
            categories: (data.categories && data.categories.length > 0) ? data.categories : ['Notes', 'Assignments', 'Important Questions', 'Previous Year Papers'],
            subjects: data.subjects || [],
            semesters: data.semesters || [],
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleFilterClick = () => {
    navigate('/app/browse');
  };

  const displayName = isAuthenticated && user?.name ? user.name : 'Chik';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="desktop-grid-3col">
        {/* Left / Center Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          {/* Welcome Banner matching Screenshot */}
          <section
            className="glass-panel"
            style={{
              padding: '2rem 2.25rem',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-glass-sm)',
            }}
          >
            {/* Subtle decorative wave pattern in top right */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '280px',
                height: '100%',
                opacity: 0.18,
                pointerEvents: 'none',
              }}
            >
              <svg width="280" height="140" viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 40C80 20 160 120 280 60V0H0V40Z" fill="url(#wave-grad)" />
                <path d="M0 70C90 50 180 140 280 90V0H0V70Z" fill="url(#wave-grad)" opacity="0.6" />
                <defs>
                  <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8C5535" />
                    <stop offset="100%" stopColor="#D8B598" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: '580px' }}>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Welcome back, {displayName}! 👋
              </h1>

              <p
                style={{
                  fontSize: '0.925rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                }}
              >
                Find and share academic resources with your classmates.
              </p>
            </div>
          </section>

          {/* 4 Category Cards Grid matching Screenshot */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '1rem',
            }}
            className="category-grid"
          >
            {meta.categories.slice(0, 4).map((cat) => (
              <CategoryCard key={cat} category={cat} />
            ))}
          </section>

          {/* Filter / Search Bar Section */}
          <FilterBar
            semester={semester}
            setSemester={setSemester}
            subject={subject}
            setSubject={setSubject}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sort={sort}
            setSort={setSort}
            semesters={meta.semesters}
            subjects={meta.subjects}
            onFilterClick={handleFilterClick}
          />

          {/* Live Recent Uploads List */}
          <RecentUploads
            semester={semester}
            subject={subject}
            searchQuery={searchQuery}
            sort={sort}
          />
        </div>

        {/* Right Rail (Desktop) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: 'var(--right-rail-width)' }}>
          <NotificationPanel />
          <FollowedSubjects />
          <QuickUpload />
        </aside>
      </div>

      {/* App Footer matching Screenshot */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.5rem 0.5rem 0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-glass-subtle)',
          marginTop: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} AcademicShare. All rights reserved.
        </div>
        <div
          style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          Made by : Chirag Goswami, BCA (3rd SEM)
        </div>
      </footer>
    </div>
  );
}
