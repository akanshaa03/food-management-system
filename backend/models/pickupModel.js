const db = require('../config/db');
const logger = require('../utils/logger');

// In-memory runtime store for pickup schedules
let inMemoryPickups = [];

/**
 * Pickup Logistics Data Model Layer
 */
const pickupModel = {
  schedule: async (data) => {
    try {
      const query = `
        INSERT INTO pickup_requests (donation_id, scheduled_time, vehicle_number, driver_name, driver_phone, status, notes)
        VALUES ($1, $2, $3, $4, $5, 'Scheduled', $6)
        ON CONFLICT (donation_id) 
        DO UPDATE SET 
          scheduled_time = EXCLUDED.scheduled_time,
          vehicle_number = EXCLUDED.vehicle_number,
          driver_name = EXCLUDED.driver_name,
          driver_phone = EXCLUDED.driver_phone,
          status = 'Scheduled',
          notes = EXCLUDED.notes,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const values = [
        data.donationId,
        data.scheduledTime,
        data.vehicleNumber || 'VAN-8891',
        data.driverName || 'NGO Driver',
        data.driverPhone || '+1-555-0100',
        data.notes || null,
      ];
      const result = await db.query(query, values);
      if (result.rows && result.rows.length > 0) return result.rows[0];
    } catch (err) {
      logger.warn('PostgreSQL pickupModel.schedule notice:', err.message);
    }

    const item = {
      id: `p-${Date.now()}`,
      donation_id: data.donationId,
      scheduled_time: data.scheduledTime,
      vehicle_number: data.vehicleNumber || 'VAN-8891',
      driver_name: data.driverName || 'John Michael',
      driver_phone: data.driverPhone || '+1-555-0199',
      status: 'Scheduled',
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryPickups.unshift(item);
    return item;
  },

  updateStatus: async (id, status) => {
    try {
      const query = `
        UPDATE pickup_requests
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 OR donation_id = $2
        RETURNING *
      `;
      const result = await db.query(query, [status, id]);
      if (result.rows && result.rows.length > 0) return result.rows[0];
    } catch (err) {
      logger.warn('PostgreSQL pickupModel.updateStatus notice:', err.message);
    }

    const item = inMemoryPickups.find((p) => p.id === id || p.donation_id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      return item;
    }
    return { id, donation_id: id, status };
  },

  findByDonation: async (donationId) => {
    try {
      const query = `SELECT * FROM pickup_requests WHERE donation_id = $1`;
      const result = await db.query(query, [donationId]);
      if (result.rows && result.rows.length > 0) return result.rows[0];
    } catch (err) {
      logger.warn('PostgreSQL pickupModel.findByDonation notice:', err.message);
    }
    return inMemoryPickups.find((p) => p.donation_id === donationId) || null;
  },
};

module.exports = pickupModel;
