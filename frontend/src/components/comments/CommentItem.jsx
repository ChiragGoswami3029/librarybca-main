import React, { useState } from 'react';
import { Trash2, User, Clock, Loader2 } from 'lucide-react';
import IconButton from '../common/IconButton';

export default function CommentItem({
  comment,
  isAuthor = false,
  onDelete = null,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.75rem',
        background: 'var(--surface-glass-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {comment.author?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {comment.author}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '4px',
            }}
          >
            <Clock size={11} />
            {formatDate(comment.created_at)}
          </span>
        </div>

        {isAuthor && onDelete && (
          <div>
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-danger)' }} />
            ) : (
              <IconButton
                icon={Trash2}
                label="Delete comment"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
              />
            )}
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          lineHeight: 1.45,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {comment.text}
      </p>
    </div>
  );
}
