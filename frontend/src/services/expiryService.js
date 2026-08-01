import api from './api';

export const expiryService = {
  getAlerts: async () => {
    const response = await api.get('/expiry/alerts');
    return response.data;
  },

  updateThresholds: async (thresholdDays) => {
    const response = await api.put('/expiry/thresholds', { thresholdDays });
    return response.data;
  },
};
