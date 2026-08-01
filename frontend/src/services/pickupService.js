import api from './api';

/**
 * Pickup Management & Logistics API Service Methods
 */
export const pickupService = {
  /**
   * NGO Schedule Pickup
   */
  schedulePickup: async (pickupData) => {
    const response = await api.post('/pickups/schedule', pickupData);
    return response.data;
  },

  /**
   * Update Pickup Status (Pending -> Scheduled -> On Route -> Delivered -> Cancelled)
   */
  updatePickupStatus: async (id, statusData) => {
    const response = await api.patch(`/pickups/${id}/status`, statusData);
    return response.data;
  },

  /**
   * NGO Mark Delivered
   */
  markDelivered: async (id) => {
    const response = await api.post(`/pickups/${id}/delivered`);
    return response.data;
  },

  /**
   * Get Pickup Progress Timeline & Driver Details
   */
  getPickupProgress: async (id) => {
    const response = await api.get(`/pickups/${id}/progress`);
    return response.data;
  },

  /**
   * 3PL Delivery Partner Webhook Integration Sync
   */
  deliveryPartnerSync: async (payload) => {
    const response = await api.post('/pickups/delivery-partner-sync', payload);
    return response.data;
  },
};
