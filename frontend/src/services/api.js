// Centralized API Client for AcademicShare

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // Add JWT token if stored
  const token = localStorage.getItem('academicshare_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If body is NOT FormData and not already Content-Type set, default to application/json
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === 'object' && !(options.body instanceof String)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      // If 401 Unauthorized, notify auth listeners
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('academicshare:unauthorized'));
      }

      const errorMessage =
        (data && typeof data === 'object' && (data.error || data.message)) ||
        `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const message =
      error instanceof TypeError
        ? 'Unable to connect to the server. Please make sure the backend is running and try again.'
        : error.message || 'Unable to connect to the server. Please check your network.';

    throw new ApiError(message, 0, null);
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
