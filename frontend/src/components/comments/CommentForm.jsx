import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

export default function CommentForm({ fileId, onCommentAdded }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onCommentAdded(text.trim());
      setText('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="glass-panel-subtle"
        style={{
          padding: '1rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-md)',
          marginTop: '1rem',
        }}
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Log in to join the discussion or ask a question about this material.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
          Log in to Comment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          rows={2}
          placeholder="Ask a question, add feedback, or leave a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting}
          className="glass-input"
          style={{ resize: 'vertical', fontSize: '0.875rem' }}
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          icon={Send}
          disabled={!text.trim()}
          style={{ alignSelf: 'flex-end', height: '42px' }}
        >
          Post
        </Button>
      </div>
    </form>
  );
}
