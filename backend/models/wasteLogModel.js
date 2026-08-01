const db = require('../config/db');

/**
 * Waste Log Model Abstraction Layer
 */
const wasteLogModel = {
  /**
   * Log spoiled/wasted food entry
   */
  create: async (data) => {
    const query = `
      INSERT INTO waste_logs (donor_id, inventory_id, food_name, quantity, unit, reason, financial_loss)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.donorId,
      data.inventoryId || null,
      data.foodName,
      data.quantity,
      data.unit,
      data.reason,
      data.financialLoss || 0.00,
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Get total waste statistics
   */
  getWasteStats: async (donorId = null) => {
    let query = `
      SELECT 
        COUNT(*) as total_records,
        COALESCE(SUM(quantity), 0) as total_quantity_lost,
        COALESCE(SUM(financial_loss), 0) as total_financial_loss
      FROM waste_logs
    `;
    const params = [];
    if (donorId) {
      query += ` WHERE donor_id = $1`;
      params.push(donorId);
    }
    const result = await db.query(query, params);
    return result.rows[0];
  },
};

module.exports = wasteLogModel;
