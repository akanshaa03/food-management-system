const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');

/**
 * Inventory Module API Routes (Role-Based Access Control)
 */

// Dynamic Categories Route
router.get('/categories', authenticate, inventoryController.getCategories);

// Business Inventory CRUD Routes
router.post('/manual', authenticate, authorize('BUSINESS'), inventoryController.createManual);
router.get('/my-items', authenticate, authorize('BUSINESS'), inventoryController.getMyItems);
router.put('/:id', authenticate, authorize('BUSINESS'), inventoryController.updateItem);
router.delete('/:id', authenticate, authorize('BUSINESS'), inventoryController.deleteItem);
router.get('/:id/history', authenticate, authorize('BUSINESS'), inventoryController.getItemHistory);

// Ingestion Routes
router.post('/csv-upload', authenticate, authorize('BUSINESS'), inventoryController.uploadCSV);
router.post('/pos-sync', authenticate, authorize('BUSINESS'), inventoryController.syncPOS);
router.post('/barcode-scan', authenticate, authorize('BUSINESS'), inventoryController.scanBarcode);

// Super Admin Read-Only Route
router.get('/admin-all', authenticate, authorize('SUPER_ADMIN'), inventoryController.getAdminAllInventory);

module.exports = router;
