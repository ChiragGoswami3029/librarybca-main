import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({
  semester,
  setSemester,
  subject,
  setSubject,
  searchQuery,
  setSearchQuery,
  sort,
  setSort,
  semesters = [],
  subjects = [],
  onFilterClick = null,
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '0.85rem 1.25rem',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-glass-sm)',
      }}
    >
      {/* Semester Dropdown */}
      <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="glass-input glass-select"
          style={{
            height: '42px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '12px',
            paddingLeft: '12px',
            paddingRight: '32px',
          }}
          aria-label="Filter by semester"
        >
          <option value="">All Semesters</option>
          {semesters.map((s) => (
            <option key={s} value={s}>
              {s.includes('Sem') ? s : `${s}rd Semester`}
            </option>
          ))}
        </select>
      </div>

      {/* Subject Dropdown */}
      <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="glass-input glass-select"
          style={{
            height: '42px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '12px',
            paddingLeft: '12px',
            paddingRight: '32px',
          }}
          aria-label="Filter by subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', flex: '2 1 220px', minWidth: '180px' }}>
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
          type="search"
          placeholder="Search in all resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input"
          style={{
            paddingLeft: '38px',
            height: '42px',
            fontSize: '0.85rem',
            borderRadius: '12px',
          }}
          aria-label="Search resources"
        />
      </div>

      {/* Sort By Dropdown */}
      <div style={{ flex: '1 1 150px', minWidth: '140px' }}>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="glass-input glass-select"
          style={{
            height: '42px',
            fontSize: '0.85rem',
            fontWeight: 600,
            borderRadius: '12px',
            paddingLeft: '12px',
            paddingRight: '32px',
          }}
          aria-label="Sort resources"
        >
          <option value="newest">Sort by: Newest First</option>
          <option value="oldest">Sort by: Oldest First</option>
          <option value="alphabetical">Sort by: Alphabetical</option>
        </select>
      </div>

      {/* Filter Action Icon Button */}
      <button
        type="button"
        onClick={onFilterClick}
        className="btn btn-glass"
        style={{
          width: '42px',
          height: '42px',
          padding: 0,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}
        title="Filter options"
        aria-label="Toggle filter options"
      >
        <SlidersHorizontal size={17} />
      </button>
    </div>
  );
}
