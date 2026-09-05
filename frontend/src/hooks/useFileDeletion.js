import { useState } from 'react';
import { deleteFile } from '../services/filesApi';

export function useFileDeletion(onDeleted) {
  const [deletingFile, setDeletingFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleOpenDelete = (file) => {
    setDeletingFile(file);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteFile(deletingFile.id);
      onDeleted(deletingFile);
      setDeletingFile(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deletingFile,
    isDeleting,
    deleteError,
    handleOpenDelete,
    handleConfirmDelete,
    closeDelete: () => setDeletingFile(null),
  };
}
