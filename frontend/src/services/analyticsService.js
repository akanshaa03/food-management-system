import api from './api';

/**
 * Pure PostgreSQL SQL Aggregation Analytics Service Calls
 */
export const analyticsService = {
  /**
   * Get Business Analytics (Inventory Trends, Food Saved, Money Saved, Waste Reduction)
   */
  getBusinessAnalytics: async () => {
    const response = await api.get('/analytics/business');
    return response.data;
  },

  /**
   * Get NGO Analytics (Meals Served, Food Received, Beneficiary Count, Pickup Performance)
   */
  getNgoAnalytics: async () => {
    const response = await api.get('/analytics/ngo');
    return response.data;
  },

  /**
   * Get Platform Analytics (Businesses, NGOs, System Food Saved, CO2 Reduction, Donation Trends)
   */
  getPlatformAnalytics: async () => {
    const response = await api.get('/analytics/platform');
    return response.data;
  },
};
