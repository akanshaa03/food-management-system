const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * Notification Center API Routes
 */
router.use(authenticate);

// 1. Get User Notifications (Query ?status=UNREAD|READ|ARCHIVE)
router.get('/', notificationController.getUserNotifications);

// 2. Mark Single Notification Read
router.patch('/:id/read', notificationController.markAsRead);

// 3. Mark All Notifications Read
router.patch('/read-all', notificationController.markAllAsRead);

// 4. Archive Notification
router.patch('/:id/archive', notificationController.archiveNotification);

module.exports = router;
