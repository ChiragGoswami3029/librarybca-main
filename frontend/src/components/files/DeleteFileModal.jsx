import React from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function DeleteFileModal({ deletingFile, isDeleting, deleteError, onClose, onConfirm }) {
  if (!deletingFile) return null;

  return (
    <Modal
      isOpen={Boolean(deletingFile)}
      onClose={onClose}
      title="Delete Resource"
      maxWidth="440px"
      footer={(
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={onConfirm} icon={Trash2}>
            Delete File
          </Button>
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {deleteError && (
          <div
            role="alert"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.8rem',
            }}
          >
            {deleteError}
          </div>
        )}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          Are you sure you want to permanently delete <strong>"{deletingFile.title}"</strong>?
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          This will remove the file from storage and cascade-delete all associated comments. This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}
