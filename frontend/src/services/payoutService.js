import api from './api';

export const payoutService = {
  // Owner - Earnings summary
  getOwnerEarningsSummary: async () => {
    const response = await api.get('/api/owner/earnings/summary');
    return response.data;
  },

  // Owner - Payouts history
  getOwnerPayouts: async () => {
    const response = await api.get('/api/owner/payouts');
    return response.data;
  },

  // Owner - Transactions ledger
  getOwnerTransactions: async () => {
    const response = await api.get('/api/owner/transactions');
    return response.data;
  },

  // Owner - Dashboard overview
  getOwnerDashboard: async () => {
    const response = await api.get('/api/owner/dashboard');
    return response.data;
  },

  // Admin - All payouts
  getAllPayouts: async () => {
    const response = await api.get('/api/admin/payouts');
    return response.data;
  },

  // Admin - Pending payouts
  getPendingPayouts: async () => {
    const response = await api.get('/api/admin/payouts/pending');
    return response.data;
  },

  // Admin - Process/Settle Payout
  processPayout: async (payoutId, payoutReference, notes) => {
    const response = await api.put(`/api/admin/payouts/${payoutId}/process`, {
      payoutReference,
      notes
    });
    return response.data;
  },

  // Admin - Dashboard overview
  getAdminDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  // Admin - Users list
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  }
};

export default payoutService;
