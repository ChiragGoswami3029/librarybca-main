import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  ExternalLink,
  User,
  Calendar,
  FileText,
  FileArchive,
} from 'lucide-react';
import { getFiles, getViewUrl, getDownloadUrl } from '../services/filesApi';
import CommentList from '../components/comments/CommentList';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';

export default function FileDetails() {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadFileDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allFiles = await getFiles();
      const match = Array.isArray(allFiles) ? allFiles.find((f) => String(f.id) === String(fileId)) : null;
      if (!match) {
        throw new Error('Resource not found or has been removed.');
      }
      setFile(match);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadFileDetails();
  }, [loadFileDetails]);

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

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height="36px" width="140px" />
        <Skeleton height="160px" />
        <Skeleton height="400px" />
      </div>
    );
  }

  if (error || !file) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <ErrorState
          title="Resource Not Found"
          message={error?.message || 'The requested file could not be found.'}
          onRetry={() => navigate('/app/browse')}
        />
      </div>
    );
  }

  const ext = getFileExtension(file.original_name);
  const isPdf = ext === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext);
  const isText = ['txt', 'py', 'php', 'js', 'html', 'css', 'json', 'md'].includes(ext);
  const isDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);
  const isArchive = ['zip', 'rar', '7z', 'tar'].includes(ext);

  const viewUrl = getViewUrl(file.id);
  const downloadUrl = getDownloadUrl(file.id);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Header Info Card */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            {/* Category / Subject Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {file.category}
              </span>
              <span className="badge" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                {file.subject}
              </span>
              <span className="badge" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                Semester {file.semester}
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              {file.title}
            </h1>

            {/* Metadata (Uploader & Date) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <User size={15} style={{ color: 'var(--accent-primary)' }} />
                Uploaded by <strong style={{ color: 'var(--text-primary)' }}>{file.uploader}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={15} style={{ color: 'var(--accent-primary)' }} />
                {formatDate(file.upload_date)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
                {file.original_name}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-glass"
              title="Open file in new tab"
            >
              <ExternalLink size={16} />
              <span>Open in Tab</span>
            </a>

            <a
              href={downloadUrl}
              download={file.original_name}
              className="btn btn-primary"
              title="Download file directly"
            >
              <Download size={16} />
              <span>Download File</span>
            </a>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <Eye size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Inline Preview</h2>
        </div>

        <div
          style={{
            width: '100%',
            minHeight: '480px',
            maxHeight: '750px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-modal)',
            border: '1px solid var(--border-glass)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isPdf ? (
            <iframe
              src={viewUrl}
              title={`Preview of ${file.title}`}
              style={{
                width: '100%',
                height: '650px',
                border: 'none',
                background: '#ffffff',
              }}
              onError={() => setPreviewError(true)}
            />
          ) : isImage ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', width: '100%' }}>
              <img
                src={viewUrl}
                alt={file.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  borderRadius: 'var(--radius-md)',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : isText ? (
            <iframe
              src={viewUrl}
              title={`Preview of ${file.title}`}
              style={{
                width: '100%',
                height: '500px',
                border: 'none',
                padding: '1rem',
                background: 'var(--surface-modal)',
                color: 'var(--text-primary)',
              }}
            />
          ) : (
            /* Non-previewable office or archive file */
            <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '420px' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                {isArchive ? <FileArchive size={32} /> : <FileText size={32} />}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Preview not available for .{ext} files
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                This file format requires desktop software. Please download the file to open it.
              </p>
              <a href={downloadUrl} download={file.original_name} className="btn btn-primary">
                <Download size={16} />
                <span>Download {file.original_name}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Discussion & Comments */}
      <CommentList fileId={file.id} />
    </div>
  );
}
