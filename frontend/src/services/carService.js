import api from './api';

export const carService = {
  // Public - Search cars with filters
  searchCars: async (params = {}) => {
    const response = await api.get('/api/cars/search', { params });
    return response.data;
  },

  // Public - Get all available approved cars
  getAvailableCars: async () => {
    const response = await api.get('/api/cars/available');
    return response.data;
  },

  // Public - Get single car by ID
  getCarById: async (id) => {
    const response = await api.get(`/api/cars/${id}`);
    return response.data;
  },

  // Public - Get cars by Owner ID
  getCarsByOwner: async (ownerId) => {
    const response = await api.get(`/api/cars/owner/${ownerId}`);
    return response.data;
  },

  // Owner - Add a new car listing
  addCar: async (carData) => {
    const response = await api.post('/api/cars', carData);
    return response.data;
  },

  // Owner - Delete car
  deleteCar: async (id) => {
    const response = await api.delete(`/api/cars/${id}`);
    return response.data;
  },

  // Owner - Update car details
  updateCar: async (carId, carData) => {
    const response = await api.put(`/api/cars/${carId}`, carData);
    return response.data;
  },

  // Owner - Upload compliance document (RC, INSURANCE, PUC)
  uploadCarDocument: async (carId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/cars/${carId}/documents`, formData, {
      params: { type: docType },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Owner - Delete compliance document
  deleteCarDocument: async (carId, docType) => {
    const response = await api.delete(`/api/cars/${carId}/documents`, {
      params: { type: docType }
    });
    return response.data;
  },

  // Owner - Upload car image (Cloudinary)
  uploadCarImage: async (carId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/api/cars/${carId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Owner - Delete car image
  deleteCarImage: async (carId, publicId) => {
    const response = await api.delete(`/api/cars/${carId}/images`, {
      params: { publicId }
    });
    return response.data;
  },

  // Owner - Set primary car image
  setPrimaryImage: async (carId, publicId) => {
    const response = await api.put(`/api/cars/${carId}/images/primary`, null, {
      params: { publicId }
    });
    return response.data;
  },

  // Availability Management
  getCarAvailability: async (carId) => {
    const response = await api.get(`/api/availability/${carId}`);
    return response.data;
  },

  getMyAvailability: async () => {
    const response = await api.get('/api/availability/my-availability');
    return response.data;
  },

  addAvailability: async (carId, availabilityData) => {
    const response = await api.post(`/api/availability/${carId}`, availabilityData);
    return response.data;
  },

  deleteAvailability: async (availabilityId) => {
    const response = await api.delete(`/api/availability/${availabilityId}`);
    return response.data;
  },

  // Admin Car Management
  getAdminCars: async (status = '') => {
    const params = status ? { status } : {};
    const response = await api.get('/api/admin/cars', { params });
    return response.data;
  },

  approveCar: async (carId) => {
    const response = await api.put(`/api/admin/cars/${carId}/approve`);
    return response.data;
  },

  rejectCar: async (carId, reason) => {
    const response = await api.put(`/api/admin/cars/${carId}/reject`, { reason });
    return response.data;
  },

  blockCar: async (carId, reason) => {
    const response = await api.put(`/api/admin/cars/${carId}/block`, { reason });
    return response.data;
  },

  unblockCar: async (carId) => {
    const response = await api.put(`/api/admin/cars/${carId}/unblock`);
    return response.data;
  }
};

export default carService;
