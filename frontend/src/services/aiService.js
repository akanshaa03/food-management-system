import api from './api';

/**
 * AI Service Client API Methods
 */
export const aiService = {
  /**
   * Run On-Demand AI Prediction Analysis
   */
  runPrediction: async (payload) => {
    const response = await api.post('/ai/predict', payload);
    return response.data;
  },

  forecastDemand: async (payload) => {
    const response = await api.post('/ai/forecast-demand', payload);
    return response.data;
  },

  predictWasteRisk: async (payload) => {
    const response = await api.post('/ai/predict-waste-risk', payload);
    return response.data;
  },

  patternLearning: async (payload) => {
    const response = await api.post('/ai/pattern-learning', payload);
    return response.data;
  },
};
