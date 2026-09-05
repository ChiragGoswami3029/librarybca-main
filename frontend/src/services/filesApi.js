import { apiRequest, getApiBaseUrl } from './api';

export async function getFiles({ category = '', subject = '', semester = '', q = '', sort = 'newest' } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (subject) params.append('subject', subject);
  if (semester) params.append('semester', semester);
  if (q) params.append('q', q);
  if (sort) params.append('sort', sort);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/files${queryStr}`);
}

export async function getMyFiles() {
  return apiRequest('/my-files');
}

export async function uploadFile({ file, title, category, subject, semester, onProgress }) {
  const authorization = await apiRequest('/upload/signature', {
    method: 'POST',
    body: {
      filename: file.name,
      size: file.size,
    },
  });

  const cloudinaryForm = new FormData();
  cloudinaryForm.append('file', file);
  cloudinaryForm.append('api_key', authorization.api_key);
  cloudinaryForm.append('timestamp', String(authorization.timestamp));
  cloudinaryForm.append('public_id', authorization.public_id);
  cloudinaryForm.append('signature', authorization.signature);

  onProgress?.(25);
  const cloudinaryResponse = await fetch(authorization.upload_url, {
    method: 'POST',
    body: cloudinaryForm,
  });
  const cloudinaryData = await cloudinaryResponse.json().catch(() => null);
  if (!cloudinaryResponse.ok) {
    throw new Error(cloudinaryData?.error?.message || 'Cloudinary upload failed.');
  }
  onProgress?.(80);

  const result = await apiRequest('/upload/metadata', {
    method: 'POST',
    body: {
      title,
      category,
      subject,
      semester,
      original_name: file.name,
      upload_token: authorization.upload_token,
      cloudinary: cloudinaryData,
    },
  });
  onProgress?.(100);
  return result;
}

export async function updateFile(fileId, data) {
  return apiRequest(`/files/${fileId}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteFile(fileId) {
  return apiRequest(`/files/${fileId}`, {
    method: 'DELETE',
  });
}

export function getViewUrl(fileId) {
  return `${getApiBaseUrl()}/files/${fileId}/view`;
}

export function getDownloadUrl(fileId) {
  return `${getApiBaseUrl()}/files/${fileId}/download`;
}
