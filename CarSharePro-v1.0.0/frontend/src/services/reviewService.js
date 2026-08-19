import api from './api';

export const reviewService = {
  // Renter - Add review for completed booking
  addReview: async (reviewData) => {
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
  },

  // Public - Get reviews for a specific car
  getCarReviews: async (carId) => {
    const response = await api.get(`/api/reviews/car/${carId}`);
    return response.data;
  },

  // Public - Get reviews for a car owner
  getOwnerReviews: async (ownerId) => {
    const response = await api.get(`/api/reviews/owner/${ownerId}`);
    return response.data;
  },

  // Get review by booking ID
  getBookingReview: async (bookingId) => {
    try {
      const response = await api.get(`/api/reviews/booking/${bookingId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null;
      }
      throw err;
    }
  },

  // Admin - Get all reviews
  getAllReviews: async () => {
    const response = await api.get('/api/admin/reviews');
    return response.data;
  }
};

export default reviewService;
