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
  const authorization = await apiRequest('/upload/b2/signature', {
    method: 'POST',
    body: {
      filename: file.name,
      size: file.size,
      content_type: file.type || 'application/octet-stream',
    },
  });

  await uploadToB2(authorization.upload_url, file, authorization.content_type, onProgress);

  const result = await apiRequest('/upload/b2/metadata', {
    method: 'POST',
    body: {
      title,
      category,
      subject,
      semester,
      original_name: file.name,
      upload_token: authorization.upload_token,
    },
  });
  onProgress?.(100);
  return result;
}

function uploadToB2(uploadUrl, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', uploadUrl);
    request.setRequestHeader('Content-Type', contentType);
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 90));
      }
    });
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error('B2 upload failed.'));
      }
    });
    request.addEventListener('error', () => reject(new Error('B2 upload failed.')));
    request.addEventListener('abort', () => reject(new Error('B2 upload was cancelled.')));
    request.send(file);
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
