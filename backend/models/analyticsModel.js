const db = require('../config/db');

/**
 * Pure PostgreSQL SQL Aggregation Analytics Model
 */
const analyticsModel = {
  /**
   * Business Analytics via PostgreSQL SQL Aggregations
   */
  getBusinessAnalytics: async (businessId) => {
    // Total Products, Expiring Soon, Expired, Categories
    const invCountsQuery = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN expiry_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 1 END) as expiring_soon,
        COUNT(CASE WHEN expiry_date <= CURRENT_TIMESTAMP THEN 1 END) as expired_products,
        COUNT(DISTINCT category_name) as categories_count
      FROM inventory
      WHERE business_id = $1
    `;

    // Donation Logs & Transactions
    const donCountsQuery = `
      SELECT 
        COUNT(*) as donation_logs_count
      FROM donations
      WHERE business_id = $1
    `;

    const txCountsQuery = `
      SELECT COUNT(*) as transactions_count
      FROM pickup_requests pr
      JOIN donations d ON pr.donation_id = d.id
      WHERE d.business_id = $1
    `;

    const invTrendQuery = `
      SELECT COALESCE(category_name, 'General') as category_name, 
             SUM(quantity) as total_qty, 
             COUNT(*) as item_count
      FROM inventory
      WHERE business_id = $1
      GROUP BY category_name
      ORDER BY total_qty DESC
    `;

    const [invRes, donRes, txRes, trendRes] = await Promise.all([
      db.query(invCountsQuery, [businessId]),
      db.query(donCountsQuery, [businessId]),
      db.query(txCountsQuery, [businessId]),
      db.query(invTrendQuery, [businessId]),
    ]);

    const totalProducts = parseInt(invRes.rows[0]?.total_products || 0, 10);
    const expiringSoon = parseInt(invRes.rows[0]?.expiring_soon || 0, 10);
    const expiredProducts = parseInt(invRes.rows[0]?.expired_products || 0, 10);
    const categoriesCount = parseInt(invRes.rows[0]?.categories_count || 0, 10);
    const donationLogsCount = parseInt(donRes.rows[0]?.donation_logs_count || 0, 10);
    const transactionsCount = parseInt(txRes.rows[0]?.transactions_count || 0, 10);

    return {
      totalProducts,
      expiringSoon,
      expiredProducts,
      categoriesCount,
      donationLogsCount,
      transactionsCount,
      inventoryTrends: trendRes.rows,
    };
  },

  /**
   * NGO Analytics via PostgreSQL SQL Aggregation
   */
  getNgoAnalytics: async (ngoId) => {
    const availQuery = `SELECT COUNT(*) as count FROM donations WHERE status = 'AVAILABLE' AND expiry_date > CURRENT_TIMESTAMP`;
    const todayPickupsQuery = `SELECT COUNT(*) as count FROM pickup_requests WHERE ngo_id = $1 AND DATE(pickup_date) = CURRENT_DATE`;
    const completedQuery = `SELECT COUNT(*) as count FROM donations WHERE ngo_id = $1 AND status = 'COMPLETED'`;
    const recentActQuery = `
      SELECT pr.*, d.title as donation_title, b.business_name
      FROM pickup_requests pr
      JOIN donations d ON pr.donation_id = d.id
      JOIN businesses b ON d.business_id = b.id
      WHERE d.ngo_id = $1
      ORDER BY pr.updated_at DESC LIMIT 5
    `;

    const [availRes, todayRes, compRes, actRes] = await Promise.all([
      db.query(availQuery),
      db.query(todayPickupsQuery, [ngoId]),
      db.query(completedQuery, [ngoId]),
      db.query(recentActQuery, [ngoId]),
    ]);

    return {
      availableDonations: parseInt(availRes.rows[0]?.count || 0, 10),
      todaysPickups: parseInt(todayRes.rows[0]?.count || 0, 10),
      completedDonations: parseInt(compRes.rows[0]?.count || 0, 10),
      recentActivities: actRes.rows,
    };
  },

  /**
   * Platform Master Analytics via PostgreSQL SQL Aggregation
   */
  getPlatformAnalytics: async () => {
    const userCountsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = FALSE THEN 1 END) as pending_approvals,
        COUNT(CASE WHEN role = 'BUSINESS' AND is_active = TRUE THEN 1 END) as active_businesses,
        COUNT(CASE WHEN role = 'NGO' AND is_active = TRUE THEN 1 END) as active_ngos
      FROM users
    `;

    const wasteStatsQuery = `
      SELECT COALESCE(SUM(quantity), 0) as total_food_saved_kg 
      FROM donations 
      WHERE status IN ('ACCEPTED', 'PICKED_UP', 'COMPLETED')
    `;

    const [userRes, wasteRes] = await Promise.all([
      db.query(userCountsQuery),
      db.query(wasteStatsQuery),
    ]);

    const totalUsers = parseInt(userRes.rows[0]?.total_users || 0, 10);
    const pendingApprovals = parseInt(userRes.rows[0]?.pending_approvals || 0, 10);
    const activeBusinesses = parseInt(userRes.rows[0]?.active_businesses || 0, 10);
    const activeNgos = parseInt(userRes.rows[0]?.active_ngos || 0, 10);
    const foodSavedKg = parseFloat(wasteRes.rows[0]?.total_food_saved_kg) || 0;
    const co2ReductionTons = Math.round(foodSavedKg * 0.0025 * 10) / 10;

    return {
      totalUsers,
      pendingApprovals,
      activeBusinesses,
      activeNgos,
      foodSavedKg,
      co2ReductionTons,
    };
  },
};

module.exports = analyticsModel;
