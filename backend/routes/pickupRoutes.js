const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

/**
 * Pickup Management & 3PL Logistics Routes
 */

// 1. Schedule Pickup (NGO Role)
router.post(
  '/schedule',
  authenticate,
  authorize('NGO'),
  pickupController.schedulePickup
);

// 2. Update Pickup Status (Pending, Scheduled, On Route, Delivered, Cancelled)
router.patch(
  '/:id/status',
  authenticate,
  authorize('NGO', 'SUPER_ADMIN'),
  pickupController.updatePickupStatus
);

// 3. Mark Delivered (NGO Role)
router.post(
  '/:id/delivered',
  authenticate,
  authorize('NGO'),
  pickupController.markDelivered
);

// 4. Get Pickup Progress Timeline & Vehicle Details (Business, NGO, Admin)
router.get(
  '/:id/progress',
  authenticate,
  pickupController.getPickupProgress
);

// 5. Extensible 3PL Delivery Partner Integration Webhook API
router.post(
  '/delivery-partner-sync',
  pickupController.deliveryPartnerSync
);

module.exports = router;
