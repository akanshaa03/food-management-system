import api from './api';

/**
 * Surplus Food Redistribution API Service Calls
 */
export const donationService = {
  /**
   * Publish a new Surplus Food Donation
   */
  publishDonation: async (donationData) => {
    const response = await api.post('/donations/publish', donationData);
    return response.data;
  },

  /**
   * Get AVAILABLE Surplus Food Listings for NGO Dashboard
   */
  getAvailableForNgo: async () => {
    const response = await api.get('/donations/available');
    return response.data;
  },

  /**
   * Accept / Claim Surplus Food (NGO Only)
   * Sends PUT /donations/:id/accept REST request
   */
  acceptDonation: async (id) => {
    try {
      const response = await api.put(`/donations/${id}/accept`);
      return response.data;
    } catch (err) {
      const response = await api.post(`/donations/${id}/accept`);
      return response.data;
    }
  },

  /**
   * Get My Published Donations (Business Only)
   */
  getMyDonations: async () => {
    const response = await api.get('/donations/my-donations');
    return response.data;
  },

  /**
   * Get My Accepted Claims (NGO Only)
   */
  getMyClaims: async () => {
    const response = await api.get('/donations/my-claims');
    return response.data;
  },

  /**
   * Get NGO History Logs
   */
  getNgoHistory: async () => {
    const response = await api.get('/donations/ngo-history');
    return response.data;
  },

  /**
   * Update Donation Lifecycle Status (AVAILABLE, ACCEPTED, PICKED_UP, COMPLETED, CANCELLED)
   */
  updateStatus: async (id, status) => {
    const response = await api.patch(`/donations/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete Donation Record
   */
  deleteDonation: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },
};
