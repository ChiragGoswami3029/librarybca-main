import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, RotateCcw, X } from 'lucide-react';
import { getFiles } from '../services/filesApi';
import { getMeta } from '../services/metaApi';
import FileList from '../components/files/FileList';
import Dropdown from '../components/common/Dropdown';
import Button from '../components/common/Button';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // URL state
  const initialCategory = searchParams.get('category') || '';
  const initialSubject = searchParams.get('subject') || '';
  const initialSemester = searchParams.get('semester') || '';
  const initialQ = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  // Filters state
  const [category, setCategory] = useState(initialCategory);
  const [subject, setSubject] = useState(initialSubject);
  const [semester, setSemester] = useState(initialSemester);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [sort, setSort] = useState(initialSort);

  // Dynamic dropdown metadata from GET /meta
  const [meta, setMeta] = useState({
    categories: [],
    subjects: [],
    semesters: [],
  });

  // Results state
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search query
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Fetch metadata on mount
  useEffect(() => {
    getMeta()
      .then((data) => {
        if (data) {
          setMeta({
            categories: data.categories || [],
            subjects: data.subjects || [],
            semesters: data.semesters || [],
          });
        }
      })
      .catch(() => {
        // Silently keep empty meta
      });
  }, []);

  // Sync state with URL params when URL changes (e.g. back/forward button or CategoryCard navigation)
  useEffect(() => {
    const urlCat = searchParams.get('category') || '';
    const urlSub = searchParams.get('subject') || '';
    const urlSem = searchParams.get('semester') || '';
    const urlQ = searchParams.get('q') || '';
    const urlSort = searchParams.get('sort') || 'newest';

    setCategory(urlCat);
    setSubject(urlSub);
    setSemester(urlSem);
    setSearchQuery(urlQ);
    setSort(urlSort);
  }, [searchParams]);

  // Execute search/filter query
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFiles({
        category,
        subject,
        semester,
        q: debouncedSearch,
        sort,
      });
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [category, subject, semester, debouncedSearch, sort]);

  useEffect(() => {
    fetchResults();

    // Update URL params
    const nextParams = {};
    if (category) nextParams.category = category;
    if (subject) nextParams.subject = subject;
    if (semester) nextParams.semester = semester;
    if (debouncedSearch) nextParams.q = debouncedSearch;
    if (sort && sort !== 'newest') nextParams.sort = sort;

    setSearchParams(nextParams, { replace: true });
  }, [category, subject, semester, debouncedSearch, sort]);

  const handleResetFilters = () => {
    setCategory('');
    setSubject('');
    setSemester('');
    setSearchQuery('');
    setSort('newest');
  };

  const hasActiveFilters = category || subject || semester || debouncedSearch || sort !== 'newest';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Browse Resources
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Filter by academic category, BCA subject, and semester.
          </p>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetFilters}>
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Search & Sort Row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="search"
              placeholder="Search titles, subjects, uploaders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '36px', height: '40px' }}
              aria-label="Search resources"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                aria-label="Clear search input"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div style={{ width: '180px', flexShrink: 0 }}>
            <Dropdown
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
              ]}
              placeholder="Sort by"
            />
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-glass-subtle)',
          }}
        >
          {/* Category Selector */}
          <Dropdown
            label="Category"
            id="filter-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={meta.categories.map((c) => ({ value: c, label: c }))}
            placeholder="All Categories"
          />

          {/* Subject Selector */}
          <Dropdown
            label="Subject"
            id="filter-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={meta.subjects.map((s) => ({ value: s, label: s }))}
            placeholder="All Subjects"
          />

          {/* Semester Selector */}
          <Dropdown
            label="Semester"
            id="filter-semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            options={meta.semesters.map((sem) => ({ value: sem, label: `Semester ${sem}` }))}
            placeholder="All Semesters"
          />
        </div>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active filters:</span>
          {category && (
            <span className="badge badge-accent" style={{ gap: '6px' }}>
              Category: {category}
              <button
                type="button"
                onClick={() => setCategory('')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                aria-label="Remove category filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {subject && (
            <span className="badge badge-accent" style={{ gap: '6px' }}>
              Subject: {subject}
              <button
                type="button"
                onClick={() => setSubject('')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                aria-label="Remove subject filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {semester && (
            <span className="badge badge-accent" style={{ gap: '6px' }}>
              Sem: {semester}
              <button
                type="button"
                onClick={() => setSemester('')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                aria-label="Remove semester filter"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {debouncedSearch && (
            <span className="badge badge-accent" style={{ gap: '6px' }}>
              Search: "{debouncedSearch}"
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                aria-label="Remove search query"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Header & List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {isLoading ? 'Loading resources...' : `${files.length} ${files.length === 1 ? 'Resource' : 'Resources'}`}
          </h2>
        </div>

        <FileList
          files={files}
          isLoading={isLoading}
          error={error}
          onRetry={fetchResults}
          emptyTitle="No matching resources"
          emptyDescription="Try clearing some filters or searching for a different term."
          currentUserId={user?.id}
          isAdmin={Boolean(user?.is_admin)}
        />
      </div>
    </div>
  );
}
