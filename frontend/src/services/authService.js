import api from './api';

export const authService = {
  // Register: POST /api/auth/register
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Login: POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data; // { token, userId, name, role }
  },

  // Verify Email: GET /api/auth/verify-email?token={token}
  verifyEmail: async (token) => {
    const response = await api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  // Resend Verification Email: POST /api/auth/resend-verification
  resendVerification: async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  }
};

export default authService;
