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

export async function uploadFile(formData) {
  return apiRequest('/upload', {
    method: 'POST',
    body: formData, // FormData instance
  });
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
