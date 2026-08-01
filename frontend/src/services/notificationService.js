import api from './api';

/**
 * Notification Center API Service Methods
 */
export const notificationService = {
  /**
   * Get User Notifications (status: UNREAD, READ, ARCHIVE)
   */
  getNotifications: async (status = 'UNREAD') => {
    const response = await api.get(`/notifications?status=${status}`);
    return response.data;
  },

  /**
   * Mark Single Notification Read
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark All Notifications Read
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Archive Notification
   */
  archiveNotification: async (id) => {
    const response = await api.patch(`/notifications/${id}/archive`);
    return response.data;
  },
};
