import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Unwrap the shared envelope so callers get `data` directly on success, and a
 * predictable Error (with .message + .fieldErrors) on failure. This keeps every
 * page's try/catch simple.
 */
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        const err = new Error(body.message || 'Request failed');
        err.fieldErrors = body.errors || [];
        return Promise.reject(err);
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    const payload = error.response?.data;
    const message =
      payload?.message ||
      (error.code === 'ECONNABORTED' ? 'The request timed out' : null) ||
      error.message ||
      'Network error — is the API running?';
    const normalized = new Error(message);
    normalized.fieldErrors = payload?.errors || [];
    normalized.status = error.response?.status;
    return Promise.reject(normalized);
  }
);

export default api;
