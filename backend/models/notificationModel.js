const db = require('../config/db');

/**
 * Notification Center Data Model Layer
 */
const notificationModel = {
  /**
   * Fetch User Notifications by Status (UNREAD, READ, ARCHIVE)
   */
  getUserNotifications: async (userId, statusFilter = 'UNREAD') => {
    let whereClause = 'WHERE user_id = $1';
    const sUpper = statusFilter.toUpperCase();

    if (sUpper === 'UNREAD') {
      whereClause += ' AND is_read = FALSE AND is_archived = FALSE';
    } else if (sUpper === 'READ') {
      whereClause += ' AND is_read = TRUE AND is_archived = FALSE';
    } else if (sUpper === 'ARCHIVE' || sUpper === 'ARCHIVED') {
      whereClause += ' AND is_archived = TRUE';
    }

    const query = `
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Mark Single Notification as Read
   */
  markAsRead: async (id, userId) => {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Mark All User Notifications as Read
   */
  markAllAsRead: async (userId) => {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING *
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  /**
   * Archive Notification
   */
  archiveNotification: async (id, userId) => {
    const query = `
      UPDATE notifications
      SET is_archived = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  },

  /**
   * Create Notification (Internal Helper)
   */
  createNotification: async (userId, title, message, notificationType = 'INFO') => {
    const query = `
      INSERT INTO notifications (user_id, title, message, notification_type, is_read, is_archived)
      VALUES ($1, $2, $3, $4, FALSE, FALSE)
      RETURNING *
    `;
    const result = await db.query(query, [userId, title, message, notificationType]);
    return result.rows[0];
  },
};

module.exports = notificationModel;
