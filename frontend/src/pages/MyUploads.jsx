import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderHeart, Plus, AlertCircle } from 'lucide-react';
import { getMyFiles, updateFile } from '../services/filesApi';
import { getMeta } from '../services/metaApi';
import FileRow from '../components/files/FileRow';
import Modal from '../components/common/Modal';
import Dropdown from '../components/common/Dropdown';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import DeleteFileModal from '../components/files/DeleteFileModal';
import { useFileDeletion } from '../hooks/useFileDeletion';

export default function MyUploads() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown options for editing
  const [meta, setMeta] = useState({
    categories: [],
    subjects: [],
    semesters: [],
  });

  // Edit Modal State
  const [editingFile, setEditingFile] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const {
    deletingFile,
    isDeleting,
    deleteError,
    handleOpenDelete,
    handleConfirmDelete,
    closeDelete,
  } = useFileDeletion((deletedFile) => {
    setFiles((prev) => prev.filter((file) => file.id !== deletedFile.id));
  });

  const loadMyUploads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyFiles();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyUploads();
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
      .catch(() => {});
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (file) => {
    setEditingFile(file);
    setEditTitle(file.title);
    setEditCategory(file.category);
    setEditSubject(file.subject);
    setEditSemester(file.semester);
    setEditError('');
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingFile) return;

    setIsSavingEdit(true);
    setEditError('');
    try {
      const res = await updateFile(editingFile.id, {
        title: editTitle.trim(),
        category: editCategory,
        subject: editSubject,
        semester: editSemester,
      });

      if (res?.file) {
        setFiles((prev) =>
          prev.map((f) => (f.id === editingFile.id ? { ...f, ...res.file } : f))
        );
      }
      setEditingFile(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update file.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            My Uploads
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage, edit metadata, or remove resources you have shared with the class.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => navigate('/app/upload')}>
          Upload New Material
        </Button>
      </div>

      {/* Uploads List */}
      <div>
        {isLoading ? (
          <div>
            <Skeleton type="row" height="72px" />
            <Skeleton type="row" height="72px" />
            <Skeleton type="row" height="72px" />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load your uploads"
            message={error.message || 'Unable to retrieve your files.'}
            onRetry={loadMyUploads}
          />
        ) : files.length === 0 ? (
          <EmptyState
            icon={FolderHeart}
            title="You haven't uploaded anything yet"
            description="Share study notes, practical solutions, or exam question papers to help your classmates."
            actionLabel="Upload First Resource"
            actionIcon={Plus}
            onAction={() => navigate('/app/upload')}
          />
        ) : (
          <div>
            {files.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                isOwner={true}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFile && (
        <Modal
          isOpen={Boolean(editingFile)}
          onClose={() => setEditingFile(null)}
          title="Edit Resource Details"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditingFile(null)} disabled={isSavingEdit}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSavingEdit}
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editCategory || !editSubject || !editSemester}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editError && (
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
                <span>{editError}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="edit-title" style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                Title <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="glass-input"
                required
              />
            </div>

            <Dropdown
              label="Category"
              id="edit-category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              options={meta.categories.map((c) => ({ value: c, label: c }))}
              required
            />

            <Dropdown
              label="Subject"
              id="edit-subject"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              options={meta.subjects.map((s) => ({ value: s, label: s }))}
              required
            />

            <Dropdown
              label="Semester"
              id="edit-semester"
              value={editSemester}
              onChange={(e) => setEditSemester(e.target.value)}
              options={meta.semesters.map((sem) => ({ value: sem, label: `Semester ${sem}` }))}
              required
            />
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteFileModal
        deletingFile={deletingFile}
        isDeleting={isDeleting}
        deleteError={deleteError}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
