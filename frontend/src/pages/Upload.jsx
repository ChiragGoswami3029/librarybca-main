import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import { uploadFile } from '../services/filesApi';
import { getMeta } from '../services/metaApi';
import { useAuth } from '../context/AuthContext';
import Dropdown from '../components/common/Dropdown';
import Button from '../components/common/Button';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'zip', 'txt'];
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ADD_NEW_SUBJECT = '+ Add new subject';

export default function Upload() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customSubjectError, setCustomSubjectError] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState(null);

  // Dropdown options from /meta
  const [meta, setMeta] = useState({
    categories: [],
    subjects: [],
    semesters: [],
  });

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load dropdown options
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
      .catch(() => {});
  }, []);

  const handleFileChange = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Invalid file format (.${ext}). Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`
      );
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage('File size cannot exceed 25 MB.');
      return;
    }

    setFile(selectedFile);

    // Auto-fill title if empty
    if (!title.trim()) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(baseName);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setCustomSubjectError('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a descriptive title for this resource.');
      return;
    }
    if (!category) {
      setErrorMessage('Please select a category.');
      return;
    }

    let finalSubject = subject;
    if (subject === ADD_NEW_SUBJECT) {
      const trimmedCustom = customSubject.trim();
      if (!trimmedCustom) {
        setCustomSubjectError('Please enter a custom subject name.');
        setErrorMessage('Please enter a custom subject name.');
        return;
      }
      if (trimmedCustom.length > 100) {
        setCustomSubjectError('Subject name cannot exceed 100 characters.');
        setErrorMessage('Subject name cannot exceed 100 characters.');
        return;
      }
      finalSubject = trimmedCustom;
    } else if (!subject) {
      setErrorMessage('Please select a BCA subject.');
      return;
    }

    if (!semester) {
      setErrorMessage('Please select a semester.');
      return;
    }
    if (!file) {
      setErrorMessage('Please attach a document or file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadFile({
        file,
        title: title.trim(),
        category,
        subject: finalSubject,
        semester,
      });
      setSuccessMessage('File uploaded successfully! Redirecting...');
      setTimeout(() => {
        if (res?.file?.id) {
          navigate(`/app/files/${res.file.id}`);
        } else {
          navigate('/app/my-uploads');
        }
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Upload Academic Resource
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Share class notes, assignments, viva questions, or past papers with your BCA peers.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div
              role="alert"
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                color: 'var(--color-success)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Attach File <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-glass-strong)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'var(--accent-subtle)' : 'var(--input-bg)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files[0])}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.txt"
              />

              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileCheck size={26} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Click or drop another file to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <UploadCloud size={26} />
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Drop your file here, or <span style={{ color: 'var(--accent-primary)' }}>browse</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports PDF, DOCX, PPTX, Images, ZIP, TXT
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resource Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="upload-title" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Document Title <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="upload-title"
              type="text"
              placeholder="e.g. Unit 3 Trees and Graphs Complete Lecture Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              required
              className="glass-input"
              style={{ height: '42px' }}
            />
          </div>

          {/* Metadata Dropdowns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Category */}
            <Dropdown
              label="Category"
              id="upload-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={meta.categories.map((c) => ({ value: c, label: c }))}
              placeholder="Select Category"
              required
              disabled={isUploading}
            />

            {/* Subject */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Dropdown
                label="Subject"
                id="upload-subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (e.target.value !== ADD_NEW_SUBJECT) {
                    setCustomSubject('');
                    setCustomSubjectError('');
                  }
                }}
                options={[
                  ...meta.subjects.map((s) => ({ value: s, label: s })),
                  { value: ADD_NEW_SUBJECT, label: ADD_NEW_SUBJECT },
                ]}
                placeholder="Select BCA Subject"
                required
                disabled={isUploading}
              />

              {subject === ADD_NEW_SUBJECT && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  <label
                    htmlFor="custom-subject"
                    style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                  >
                    Custom Subject Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="custom-subject"
                    type="text"
                    placeholder="e.g. Artificial Intelligence"
                    value={customSubject}
                    onChange={(e) => {
                      setCustomSubject(e.target.value);
                      if (customSubjectError) setCustomSubjectError('');
                    }}
                    disabled={isUploading}
                    required
                    className="glass-input"
                    style={{
                      height: '40px',
                      borderColor: customSubjectError ? 'var(--color-danger)' : undefined,
                    }}
                    maxLength={105}
                  />
                  {customSubjectError && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
                      {customSubjectError}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Semester */}
            <Dropdown
              label="Semester"
              id="upload-semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={meta.semesters.map((sem) => ({ value: sem, label: `Semester ${sem}` }))}
              placeholder="Select Semester"
              required
              disabled={isUploading}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => navigate(-1)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isUploading}
              disabled={
                !file ||
                !title.trim() ||
                !category ||
                !subject ||
                (subject === ADD_NEW_SUBJECT && !customSubject.trim()) ||
                !semester
              }
              icon={UploadCloud}
            >
              Upload Material
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
