const analyticsModel = require('../models/analyticsModel');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

const getBusinessId = async (user) => {
  if (user.business_id) return user.business_id;
  const profile = await userModel.findById(user.id);
  return profile ? profile.business_id : null;
};

const getNgoId = async (user) => {
  if (user.ngo_id) return user.ngo_id;
  const profile = await userModel.findById(user.id);
  return profile ? profile.ngo_id : null;
};

const analyticsController = {
  /**
   * Get Business Analytics Report (SQL Aggregation)
   * GET /api/v1/analytics/business
   */
  getBusinessAnalytics: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const analytics = await analyticsModel.getBusinessAnalytics(businessId);
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get NGO Analytics Report (SQL Aggregation)
   * GET /api/v1/analytics/ngo
   */
  getNgoAnalytics: async (req, res, next) => {
    try {
      const ngoId = await getNgoId(req.user);
      const analytics = await analyticsModel.getNgoAnalytics(ngoId);
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get System-Wide Platform Master Analytics Report (SQL Aggregation)
   * GET /api/v1/analytics/platform
   */
  getPlatformAnalytics: async (req, res, next) => {
    try {
      const analytics = await analyticsModel.getPlatformAnalytics();
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyticsController;
