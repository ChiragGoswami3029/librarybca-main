import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { getComments, addComment, deleteComment } from '../../services/commentsApi';
import { useAuth } from '../../context/AuthContext';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import Skeleton from '../common/Skeleton';
import ErrorState from '../common/ErrorState';

export default function CommentList({ fileId, onCommentCountChange = null }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getComments(fileId);
      const items = Array.isArray(data) ? data : [];
      setComments(items);
      if (onCommentCountChange) onCommentCountChange(items.length);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fileId) {
      loadComments();
    }
  }, [fileId]);

  const handleAddComment = async (text) => {
    const res = await addComment(fileId, text);
    if (res?.comment) {
      const updated = [...comments, res.comment];
      setComments(updated);
      if (onCommentCountChange) onCommentCountChange(updated.length);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    if (onCommentCountChange) onCommentCountChange(updated.length);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
        <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Discussion & Questions ({comments.length})
        </h3>
      </div>

      {isLoading ? (
        <div>
          <Skeleton height="60px" style={{ marginBottom: '8px' }} />
          <Skeleton height="60px" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load comments"
          message={error.message || 'Unable to retrieve comments.'}
          onRetry={loadComments}
        />
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.5rem 0' }}>
          No comments yet. Be the first to start the discussion!
        </p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthor={user?.id !== undefined && Number(user.id) === Number(comment.author_id)}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Add Comment Input Form */}
      <CommentForm fileId={fileId} onCommentAdded={handleAddComment} />
    </div>
  );
}
