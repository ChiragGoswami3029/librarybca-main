import { apiRequest } from './api';

export async function getComments(fileId) {
  return apiRequest(`/files/${fileId}/comments`);
}

export async function addComment(fileId, text) {
  return apiRequest(`/files/${fileId}/comments`, {
    method: 'POST',
    body: { text },
  });
}

export async function deleteComment(commentId) {
  return apiRequest(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}
