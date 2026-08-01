const notificationModel = require('../models/notificationModel');
const logger = require('../utils/logger');

const notificationController = {
  /**
   * Get User Notifications (Filter by status: UNREAD, READ, ARCHIVE)
   * GET /api/v1/notifications
   */
  getUserNotifications: async (req, res, next) => {
    try {
      const statusFilter = req.query.status || 'UNREAD';
      const notifications = await notificationModel.getUserNotifications(req.user.id, statusFilter);
      return res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark Notification Read
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await notificationModel.markAsRead(id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification marked read.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark All Notifications Read
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead: async (req, res, next) => {
    try {
      const updatedList = await notificationModel.markAllAsRead(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked read.',
        data: updatedList,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Archive Notification
   * PATCH /api/v1/notifications/:id/archive
   */
  archiveNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await notificationModel.archiveNotification(id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Notification archived.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
