import axios from 'axios';
import { getStoredToken, clearStoredAuth } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for 401 / 403 handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      // Don't auto-redirect if the 401 was from login / register attempt
      const isAuthEndpoint = config?.url?.includes('/api/auth/login') || config?.url?.includes('/api/auth/register');

      if (status === 401 && !isAuthEndpoint) {
        // Unauthorized - session expired or invalid token
        clearStoredAuth();
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
