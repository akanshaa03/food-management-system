const db = require('../config/db');

/**
 * Inventory Data Model Abstraction Layer (PostgreSQL CRUD + Auditing + Admin Read-Only)
 */
const inventoryModel = {
  /**
   * Fetch Dynamic Categories List
   */
  getCategories: async () => {
    try {
      const query = `
        SELECT DISTINCT category_name FROM (
          SELECT name as category_name FROM inventory_categories
          UNION
          SELECT category_name FROM inventory
        ) cat WHERE category_name IS NOT NULL AND category_name != ''
        ORDER BY category_name ASC
      `;
      const result = await db.query(query);
      if (result.rows && result.rows.length > 0) {
        return result.rows.map((r) => r.category_name);
      }
    } catch (err) {
      // Fallback standard categories if DB offline
    }
    return ['Bakery', 'Dairy', 'Produce', 'Meat & Seafood', 'Pantry & Packaged', 'General'];
  },

  /**
   * Create a single inventory record
   */
  create: async (data) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO inventory (
          business_id, product_name, category_name, quantity, unit, 
          purchase_date, expiry_date, supplier_name, storage_condition, batch_number, ingestion_source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [
        data.businessId,
        data.productName,
        data.categoryName || 'General',
        data.quantity,
        data.unit || 'kg',
        data.purchaseDate || new Date().toISOString(),
        data.expiryDate,
        data.supplierName || 'Internal',
        data.storageCondition || 'Ambient',
        data.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
        data.ingestionSource || 'MANUAL',
      ];
      const result = await client.query(query, values);
      const item = result.rows[0];

      // Audit Log Entry
      const auditQuery = `
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
        VALUES ((SELECT user_id FROM businesses WHERE id = $1), 'CREATE_INVENTORY', 'INVENTORY', $2, $3)
      `;
      await client.query(auditQuery, [data.businessId, item.id, JSON.stringify(item)]);

      await client.query('COMMIT');
      return item;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Bulk insert inventory records (CSV Upload / POS REST API Sync)
   */
  bulkCreate: async (businessId, records, source = 'BULK') => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = [];

      for (const item of records) {
        const query = `
          INSERT INTO inventory (
            business_id, product_name, category_name, quantity, unit, 
            purchase_date, expiry_date, supplier_name, storage_condition, batch_number, ingestion_source
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;
        const values = [
          businessId,
          item.productName || item.product_name || item.itemName,
          item.categoryName || item.category || 'General',
          item.quantity,
          item.unit || 'kg',
          item.purchaseDate || item.purchase_date || new Date().toISOString(),
          item.expiryDate || item.expiry_date,
          item.supplierName || item.supplier || 'Vendor',
          item.storageCondition || item.storage_condition || 'Ambient',
          item.batchNumber || item.batch_number || `BATCH-${Math.floor(Math.random() * 900000 + 100000)}`,
          source,
        ];
        const res = await client.query(query, values);
        inserted.push(res.rows[0]);
      }

      await client.query('COMMIT');
      return inserted;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Update existing inventory product (Scoped strictly to Business ID)
   */
  update: async (id, businessId, data) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE inventory
        SET product_name = COALESCE($1, product_name),
            category_name = COALESCE($2, category_name),
            quantity = COALESCE($3, quantity),
            unit = COALESCE($4, unit),
            expiry_date = COALESCE($5, expiry_date),
            storage_condition = COALESCE($6, storage_condition),
            status = COALESCE($7, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND business_id = $9
        RETURNING *
      `;
      const values = [
        data.productName,
        data.categoryName,
        data.quantity,
        data.unit,
        data.expiryDate,
        data.storageCondition,
        data.status,
        id,
        businessId,
      ];
      const result = await client.query(query, values);
      const updated = result.rows[0];

      if (updated) {
        const auditQuery = `
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
          VALUES ((SELECT user_id FROM businesses WHERE id = $1), 'UPDATE_INVENTORY', 'INVENTORY', $2, $3)
        `;
        await client.query(auditQuery, [businessId, id, JSON.stringify(data)]);
      }

      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Delete inventory product (Scoped strictly to Business ID)
   */
  delete: async (id, businessId) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        DELETE FROM inventory
        WHERE id = $1 AND business_id = $2
        RETURNING *
      `;
      const result = await client.query(query, [id, businessId]);
      const deleted = result.rows[0];

      if (deleted) {
        const auditQuery = `
          INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes)
          VALUES ((SELECT user_id FROM businesses WHERE id = $1), 'DELETE_INVENTORY', 'INVENTORY', $2, $3)
        `;
        await client.query(auditQuery, [businessId, id, JSON.stringify(deleted)]);
      }

      await client.query('COMMIT');
      return deleted;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Fetch inventory items for a Business with Search, Filters, Sorting & Pagination
   */
  findByBusinessWithFilters: async (businessId, { search = '', category = '', status = '', sortBy = 'expiry_date', sortOrder = 'ASC', page = 1, limit = 10 }) => {
    let query = `SELECT * FROM inventory WHERE business_id = $1`;
    let countQuery = `SELECT COUNT(*) FROM inventory WHERE business_id = $1`;
    const params = [businessId];
    const countParams = [businessId];

    if (search) {
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
      query += ` AND (LOWER(product_name) LIKE LOWER($${params.length}) OR LOWER(batch_number) LIKE LOWER($${params.length}) OR LOWER(supplier_name) LIKE LOWER($${params.length}))`;
      countQuery += ` AND (LOWER(product_name) LIKE LOWER($${countParams.length}) OR LOWER(batch_number) LIKE LOWER($${countParams.length}) OR LOWER(supplier_name) LIKE LOWER($${countParams.length}))`;
    }

    if (category && category !== 'ALL') {
      params.push(category);
      countParams.push(category);
      query += ` AND category_name = $${params.length}`;
      countQuery += ` AND category_name = $${countParams.length}`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      countParams.push(status);
      query += ` AND status = $${params.length}`;
      countQuery += ` AND status = $${countParams.length}`;
    }

    const allowedSort = ['expiry_date', 'product_name', 'quantity', 'created_at'];
    const validSort = allowedSort.includes(sortBy) ? sortBy : 'expiry_date';
    const validOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${validSort} ${validOrder}`;

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.max(1, parseInt(limit, 10));
    const offset = (parsedPage - 1) * parsedLimit;

    params.push(parsedLimit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const [resItems, resCount] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams),
    ]);

    const total = parseInt(resCount.rows[0].count, 10);
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    return {
      items: resItems.rows,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
    };
  },

  /**
   * Inventory Audit History for an Item
   */
  getHistory: async (inventoryId, businessId) => {
    const query = `
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_id = $1 AND al.entity_type = 'INVENTORY'
      ORDER BY al.created_at DESC
    `;
    const result = await db.query(query, [inventoryId]);
    return result.rows;
  },

  /**
   * Super Admin Read-Only Access across ALL Businesses
   */
  findAllForAdmin: async ({ search = '', category = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' }) => {
    let query = `
      SELECT i.*, b.business_name
      FROM inventory i
      JOIN businesses b ON i.business_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (LOWER(i.product_name) LIKE LOWER($${params.length}) OR LOWER(b.business_name) LIKE LOWER($${params.length}))`;
    }

    if (category && category !== 'ALL') {
      params.push(category);
      query += ` AND i.category_name = $${params.length}`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND i.status = $${params.length}`;
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  },
};

module.exports = inventoryModel;
