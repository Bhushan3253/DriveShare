import api from './api';

export const bookingService = {
  // Public - Calculate price & preview availability
  calculatePrice: async (carId, startDate, endDate) => {
    const response = await api.get('/api/bookings/calculate-price', {
      params: { carId, startDate, endDate }
    });
    return response.data;
  },

  // Renter - Create reservation (15-min hold)
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  // Get Booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  // Renter - Get my bookings
  getMyBookings: async () => {
    const response = await api.get('/api/bookings/my-bookings');
    return response.data;
  },

  // Owner - Get owner bookings
  getOwnerBookings: async () => {
    const response = await api.get('/api/bookings/owner');
    return response.data;
  },

  // Lifecycle transitions
  checkIn: async (id, inspectionData) => {
    const response = await api.put(`/api/bookings/${id}/check-in`, inspectionData || {});
    return response.data;
  },

  startRental: async (id) => {
    const response = await api.put(`/api/bookings/${id}/start`);
    return response.data;
  },

  returnCar: async (id, inspectionData) => {
    const response = await api.put(`/api/bookings/${id}/return`, inspectionData || {});
    return response.data;
  },

  completeBooking: async (id) => {
    const response = await api.put(`/api/bookings/${id}/complete`);
    return response.data;
  },

  cancelBooking: async (id, reason) => {
    const response = await api.put(`/api/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Upload Pre-trip or Post-trip Inspection Photo (Cloudinary)
  uploadInspectionPhoto: async (bookingId, type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post(`/api/bookings/${bookingId}/inspection-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Admin - All bookings
  getAllBookings: async () => {
    const response = await api.get('/api/admin/bookings');
    return response.data;
  },

  // Admin - Force cancel booking
  forceCancelBooking: async (bookingId, reason) => {
    const response = await api.put(`/api/admin/bookings/${bookingId}/force-cancel`, { reason });
    return response.data;
  }
};

export default bookingService;
