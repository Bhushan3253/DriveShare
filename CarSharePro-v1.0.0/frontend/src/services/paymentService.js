import api from './api';

export const paymentService = {
  // Renter - Create UPI payment / QR code
  createUPIPayment: async (bookingId) => {
    const response = await api.post('/api/upi/create', null, {
      params: { bookingId }
    });
    return response.data; // { paymentId, bookingId, amount, upiUri, qrCode }
  },

  // Renter - Submit UTR number
  submitUTR: async (paymentId, utrNumber) => {
    const response = await api.post(`/api/upi/${paymentId}/utr`, { utrNumber });
    return response.data;
  },

  // Admin - Get pending UTR payments
  getPendingPayments: async () => {
    const response = await api.get('/api/upi/admin/pending');
    return response.data;
  },

  // Admin - Get all payments
  getAllPayments: async () => {
    const response = await api.get('/api/admin/payments');
    return response.data;
  },

  // Admin - Verify UTR payment
  verifyPayment: async (paymentId) => {
    const response = await api.put(`/api/upi/admin/${paymentId}/verify`);
    return response.data;
  },

  // Admin - Reject UTR payment
  rejectPayment: async (paymentId, reason) => {
    const response = await api.put(`/api/upi/admin/${paymentId}/reject`, { reason });
    return response.data;
  }
};

export default paymentService;
