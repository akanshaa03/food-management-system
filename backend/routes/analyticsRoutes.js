const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

/**
 * Pure PostgreSQL SQL Aggregation Analytics Routes
 */
router.get(
  '/business',
  authenticate,
  authorize('BUSINESS', 'SUPER_ADMIN'),
  analyticsController.getBusinessAnalytics
);

router.get(
  '/ngo',
  authenticate,
  authorize('NGO', 'SUPER_ADMIN'),
  analyticsController.getNgoAnalytics
);

router.get(
  '/platform',
  authenticate,
  authorize('SUPER_ADMIN'),
  analyticsController.getPlatformAnalytics
);

module.exports = router;
