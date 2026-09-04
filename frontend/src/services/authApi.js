import { apiRequest } from './api';

export async function registerUser({ name, email, password }) {
  return apiRequest('/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export async function loginUser({ email, password }) {
  return apiRequest('/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getProfile() {
  return apiRequest('/profile', {
    method: 'GET',
  });
}
