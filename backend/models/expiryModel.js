const db = require('../config/db');

/**
 * Expiry Tracking & Automated Alert Engine Model
 */
const expiryModel = {
  /**
   * Fetch classified inventory items with calculated remaining days until expiry
   */
  findAlertsByBusiness: async (businessId, thresholdDays = 7) => {
    const query = `
      SELECT id, product_name, category_name, quantity, unit, expiry_date, storage_condition, status,
             CEIL(EXTRACT(EPOCH FROM (expiry_date - CURRENT_TIMESTAMP)) / 86400) as days_until_expiry,
             CASE
               WHEN CEIL(EXTRACT(EPOCH FROM (expiry_date - CURRENT_TIMESTAMP)) / 86400) <= 0 THEN 'EXPIRED'
               WHEN CEIL(EXTRACT(EPOCH FROM (expiry_date - CURRENT_TIMESTAMP)) / 86400) <= $2 THEN 'EXPIRING_SOON'
               ELSE 'FRESH'
             END as expiry_classification
      FROM inventory
      WHERE business_id = $1
      ORDER BY expiry_date ASC
    `;
    const result = await db.query(query, [businessId, thresholdDays]);
    const items = result.rows;

    // Auto-generate notifications in PostgreSQL for items nearing expiry or expired
    const urgentItems = items.filter((i) => i.expiry_classification !== 'FRESH');
    for (const item of urgentItems) {
      const title = item.expiry_classification === 'EXPIRED' ? `Expired Product: ${item.product_name}` : `Expiring Soon: ${item.product_name}`;
      const message = `${item.product_name} (${item.quantity} ${item.unit}) has ${item.days_until_expiry <= 0 ? 'EXPIRED' : `${item.days_until_expiry} days remaining`}.`;
      const notifQuery = `
        INSERT INTO notifications (user_id, title, message, type)
        VALUES ((SELECT user_id FROM businesses WHERE id = $1), $2, $3, $4)
        ON CONFLICT DO NOTHING
      `;
      try {
        await db.query(notifQuery, [businessId, title, message, item.expiry_classification]);
      } catch (err) {
        // Suppress duplicate notification insertion errors
      }
    }

    return items;
  },

  /**
   * Get alert threshold preference for a business
   */
  getThreshold: async (businessId) => {
    const query = `SELECT alert_threshold_days FROM businesses WHERE id = $1`;
    const result = await db.query(query, [businessId]);
    return result.rows[0]?.alert_threshold_days || 7;
  },

  /**
   * Update alert threshold preference
   */
  updateThreshold: async (businessId, thresholdDays) => {
    const query = `UPDATE businesses SET alert_threshold_days = $2 WHERE id = $1 RETURNING alert_threshold_days`;
    const result = await db.query(query, [businessId, thresholdDays]);
    return result.rows[0]?.alert_threshold_days || thresholdDays;
  },
};

module.exports = expiryModel;
