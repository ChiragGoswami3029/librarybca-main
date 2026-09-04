import React from 'react';
import FileRow from './FileRow';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import { UploadCloud, FolderSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FileList({
  files = [],
  isLoading = false,
  error = null,
  onRetry = null,
  emptyTitle = 'No files found',
  emptyDescription = 'No academic files have been uploaded for these filters yet.',
  showUploadAction = true,
  currentUserId = null,
  onEdit = null,
  onDelete = null,
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div>
        <Skeleton type="row" height="72px" />
        <Skeleton type="row" height="72px" />
        <Skeleton type="row" height="72px" />
        <Skeleton type="row" height="72px" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load files"
        message={error?.message || 'Unable to retrieve files from the server.'}
        onRetry={onRetry}
      />
    );
  }

  if (!files || files.length === 0) {
    return (
      <EmptyState
        icon={FolderSearch}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={showUploadAction ? 'Upload Resource' : null}
        actionIcon={UploadCloud}
        onAction={showUploadAction ? () => navigate('/app/upload') : null}
      />
    );
  }

  return (
    <div>
      {files.map((file) => (
        <FileRow
          key={file.id}
          file={file}
          isOwner={currentUserId !== null && Number(currentUserId) === Number(file.uploader_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
