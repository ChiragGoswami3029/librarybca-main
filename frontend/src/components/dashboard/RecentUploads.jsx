import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFiles } from '../../services/filesApi';
import FileList from '../files/FileList';
import { useAuth } from '../../context/AuthContext';

export default function RecentUploads({
  semester = '',
  subject = '',
  searchQuery = '',
  sort = 'newest',
}) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadRecentFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFiles({
        semester,
        subject,
        q: searchQuery,
        sort,
      });
      // Show up to 8 recent files
      setFiles(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentFiles();
  }, [semester, subject, searchQuery, sort]);

  return (
    <section
      className="glass-panel"
      style={{
        padding: '1.5rem',
        borderRadius: '24px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      {/* Section Header matching Screenshot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Recent Uploads
        </h2>
        <Link
          to="/app/browse"
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          View all
        </Link>
      </div>

      {/* Resource Rows List */}
      <FileList
        files={files}
        isLoading={isLoading}
        error={error}
        onRetry={loadRecentFiles}
        emptyTitle="No recent uploads found"
        emptyDescription="Be the first to share notes or assignments for this semester!"
        currentUserId={user?.id}
      />
    </section>
  );
}
