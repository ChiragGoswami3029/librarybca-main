import { apiRequest } from './api';

export async function getMyFollows() {
  return apiRequest('/my-follows');
}

export async function followSubject(subject) {
  return apiRequest(`/subjects/${encodeURIComponent(subject)}/follow`, {
    method: 'POST',
  });
}

export async function unfollowSubject(subject) {
  return apiRequest(`/subjects/${encodeURIComponent(subject)}/follow`, {
    method: 'DELETE',
  });
}

export async function getNotifications() {
  return apiRequest('/notifications');
}

export async function markNotificationRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}
