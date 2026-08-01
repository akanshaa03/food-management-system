const db = require('../config/db');

/**
 * User Data Model Abstraction Layer (UUID PostgreSQL Schema)
 */
const userModel = {
  /**
   * Find user by email address
   */
  findByEmail: async (email) => {
    const query = `
      SELECT u.id, u.name, u.email, u.password_hash, u.role, u.is_active,
             b.id as business_id, b.business_name,
             n.id as ngo_id, n.ngo_name
      FROM users u
      LEFT JOIN businesses b ON u.id = b.user_id
      LEFT JOIN ngos n ON u.id = n.user_id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  /**
   * Find user profile by UUID
   */
  findById: async (id) => {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             b.id as business_id, b.business_name, b.license_number, b.contact_phone as business_phone, b.address as business_address,
             n.id as ngo_id, n.ngo_name, n.registration_number, n.contact_phone as ngo_phone, n.address as ngo_address
      FROM users u
      LEFT JOIN businesses b ON u.id = b.user_id
      LEFT JOIN ngos n ON u.id = n.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  /**
   * Create a new user with UUID PK
   */
  create: async ({ name, email, passwordHash, role, organizationName, phone, address }) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const insertUserQuery = `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at
      `;
      const userRes = await client.query(insertUserQuery, [name, email.toLowerCase(), passwordHash, role]);
      const newUser = userRes.rows[0];

      // Create linked business or NGO profile depending on role
      if (role === 'BUSINESS') {
        const insertBusinessQuery = `
          INSERT INTO businesses (user_id, business_name, contact_phone, address)
          VALUES ($1, $2, $3, $4)
          RETURNING id as business_id
        `;
        const bRes = await client.query(insertBusinessQuery, [newUser.id, organizationName || name, phone || null, address || null]);
        newUser.business_id = bRes.rows[0].business_id;
        newUser.organization_name = organizationName || name;
      } else if (role === 'NGO') {
        const insertNgoQuery = `
          INSERT INTO ngos (user_id, ngo_name, contact_phone, address)
          VALUES ($1, $2, $3, $4)
          RETURNING id as ngo_id
        `;
        const nRes = await client.query(insertNgoQuery, [newUser.id, organizationName || name, phone || null, address || null]);
        newUser.ngo_id = nRes.rows[0].ngo_id;
        newUser.organization_name = organizationName || name;
      }

      await client.query('COMMIT');
      return newUser;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Get all registered users (Admin view)
   */
  findAll: async () => {
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             COALESCE(b.business_name, n.ngo_name, 'System Administrator') as organization_name
      FROM users u
      LEFT JOIN businesses b ON u.id = b.user_id
      LEFT JOIN ngos n ON u.id = n.user_id
      ORDER BY u.created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },
};

module.exports = userModel;
