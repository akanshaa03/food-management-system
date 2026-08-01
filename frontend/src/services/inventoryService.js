import api from './api';

/**
 * Inventory Management API Service Methods
 */
export const inventoryService = {
  // Get dynamic categories list
  getCategories: async () => {
    const response = await api.get('/inventory/categories');
    return response.data;
  },

  // Manual Add Product
  createManual: async (productData) => {
    const response = await api.post('/inventory/manual', productData);
    return response.data;
  },

  // Get Business Inventory with Search, Category Filter & Sorting
  getMyItems: async (params = {}) => {
    const response = await api.get('/inventory/my-items', { params });
    return response.data;
  },

  // Update Inventory Item
  updateItem: async (id, updateData) => {
    const response = await api.put(`/inventory/${id}`, updateData);
    return response.data;
  },

  // Delete Inventory Item
  deleteItem: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  // Get Audit History
  getItemHistory: async (id) => {
    const response = await api.get(`/inventory/${id}/history`);
    return response.data;
  },

  // CSV Bulk Upload
  uploadCSV: async (records) => {
    const response = await api.post('/inventory/csv-upload', { records });
    return response.data;
  },

  // POS Rest API Sync
  syncPOS: async (items) => {
    const response = await api.post('/inventory/pos-sync', { items });
    return response.data;
  },

  // Barcode / QR Scan Ingestion
  scanBarcode: async (scanData) => {
    const response = await api.post('/inventory/barcode-scan', scanData);
    return response.data;
  },

  // Admin Master Read-Only View Across All Businesses
  getAdminAllInventory: async (params = {}) => {
    const response = await api.get('/inventory/admin-all', { params });
    return response.data;
  },
};
