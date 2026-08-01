const inventoryModel = require('../models/inventoryModel');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');

const getBusinessId = async (user) => {
  if (user.business_id) return user.business_id;
  try {
    const userProfile = await userModel.findById(user.id);
    if (userProfile && userProfile.business_id) {
      return userProfile.business_id;
    }
  } catch (err) {
    logger.warn('User profile query notice, using default business profile:', err.message);
  }
  return 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
};

const inventoryController = {
  getCategories: async (req, res, next) => {
    try {
      const categories = await inventoryModel.getCategories();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  createManual: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { productName, categoryName, quantity, unit, purchaseDate, expiryDate, supplierName, storageCondition, batchNumber } = req.body;

      if (!productName || !quantity || !expiryDate) {
        return res.status(400).json({
          success: false,
          message: 'Product name, quantity, and expiry date are required.',
        });
      }

      const item = await inventoryModel.create({
        businessId,
        productName,
        categoryName,
        quantity,
        unit: unit || 'kg',
        purchaseDate,
        expiryDate,
        supplierName,
        storageCondition,
        batchNumber,
        ingestionSource: 'MANUAL',
      });

      logger.info(`Inventory Product Created: ${item.product_name} [Business: ${businessId}]`);
      return res.status(201).json({
        success: true,
        message: 'Product added successfully to inventory.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  updateItem: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { id } = req.params;
      const updated = await inventoryModel.update(id, businessId, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or access unauthorized.',
        });
      }

      logger.info(`Inventory Product Updated: ${id} [Business: ${businessId}]`);
      return res.status(200).json({
        success: true,
        message: 'Product inventory updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteItem: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { id } = req.params;
      const deleted = await inventoryModel.delete(id, businessId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Product not found or access unauthorized.',
        });
      }

      logger.info(`Inventory Product Deleted: ${id} [Business: ${businessId}]`);
      return res.status(200).json({
        success: true,
        message: 'Product inventory deleted successfully.',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Business Inventory with Search, Filters, Sorting & Pagination
   * GET /api/v1/inventory/my-items
   */
  getMyItems: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { search, category, status, sortBy, sortOrder, page, limit } = req.query;

      const result = await inventoryModel.findByBusinessWithFilters(businessId, {
        search,
        category,
        status,
        sortBy,
        sortOrder,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      return res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getItemHistory: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { id } = req.params;

      const history = await inventoryModel.getHistory(id, businessId);
      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  },

  getAdminAllInventory: async (req, res, next) => {
    try {
      const { search, category, status } = req.query;
      const allItems = await inventoryModel.findAllForAdmin({ search, category, status });
      return res.status(200).json({
        success: true,
        data: allItems,
      });
    } catch (error) {
      next(error);
    }
  },

  uploadCSV: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { records } = req.body;
      const inserted = await inventoryModel.bulkCreate(businessId, records, 'CSV_UPLOAD');
      return res.status(201).json({
        success: true,
        message: `Uploaded ${inserted.length} inventory products via CSV.`,
        data: inserted,
      });
    } catch (error) {
      next(error);
    }
  },

  syncPOS: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { items } = req.body;
      const synced = await inventoryModel.bulkCreate(businessId, items, 'POS_REST_API');
      return res.status(200).json({
        success: true,
        message: `POS Webhook: Synced ${synced.length} products.`,
        data: synced,
      });
    } catch (error) {
      next(error);
    }
  },

  scanBarcode: async (req, res, next) => {
    try {
      const businessId = await getBusinessId(req.user);
      const { barcode, productName, categoryName, quantity, expiryDate } = req.body;
      const item = await inventoryModel.create({
        businessId,
        productName: productName || `Scanned Product (${barcode})`,
        categoryName: categoryName || 'General',
        quantity: quantity || 1,
        unit: 'units',
        expiryDate: expiryDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        batchNumber: `BC-${barcode}`,
        ingestionSource: 'BARCODE_SCANNER',
      });
      return res.status(201).json({
        success: true,
        message: 'Barcode scanned product created.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = inventoryController;
