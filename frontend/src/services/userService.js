import api from './api';

export const userService = {
  // User Profile
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  },

  // User Driving License / KYC Upload
  submitDrivingLicense: async (file, dlNumber, expiry) => {
    const formData = new FormData();
    formData.append('file', file);
    const params = { dlNumber };
    if (expiry) params.expiry = expiry;

    const response = await api.post('/api/users/kyc/driving-license', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin User Moderation
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  approveUserKyc: async (userId) => {
    const response = await api.put(`/api/admin/users/${userId}/kyc/approve`);
    return response.data;
  },

  rejectUserKyc: async (userId, reason) => {
    const response = await api.put(`/api/admin/users/${userId}/kyc/reject`, { reason });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/api/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/api/admin/users/${userId}/role`, null, {
      params: { role }
    });
    return response.data;
  },

  getUserDossier: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}/dossier`);
    return response.data;
  }
};

export default userService;
