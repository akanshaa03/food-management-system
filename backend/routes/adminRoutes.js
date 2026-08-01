const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

/**
 * Super Admin Master Routes (Strict Super Admin RBAC Protection)
 */
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// Platform Analytics & Management Endpoints
router.get('/platform-analytics', adminController.getPlatformAnalytics);
router.get('/users', adminController.getUsersList);
router.patch('/users/:id/approve', adminController.approveUser);
router.patch('/users/:id/reject', adminController.rejectUser);
router.patch('/users/:id/activate', adminController.activateUser);
router.patch('/users/:id/suspend', adminController.toggleSuspendUser);
router.delete('/users/:id', adminController.deleteUser);

// Master Monitors
router.get('/all-donations', adminController.getAllDonations);
router.get('/all-pickups', adminController.getAllPickups);

module.exports = router;
