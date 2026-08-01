const categoryModel = require('../models/categoryModel');
const logger = require('../utils/logger');

const categoryController = {
  /**
   * Get Categories List with Statistics
   * GET /api/v1/categories
   */
  getCategories: async (req, res, next) => {
    try {
      const categories = await categoryModel.findAllWithStats();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create Category
   * POST /api/v1/categories
   */
  createCategory: async (req, res, next) => {
    try {
      const { name, foodTaxonomyCode, perishabilityLevel, storageRequirement, description } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      const category = await categoryModel.create({
        name,
        foodTaxonomyCode,
        perishabilityLevel,
        storageRequirement,
        description,
      });

      logger.info(`Category Created: ${category.name}`);
      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Category
   * PUT /api/v1/categories/:id
   */
  updateCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await categoryModel.update(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Category
   * DELETE /api/v1/categories/:id
   */
  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await categoryModel.delete(id);
      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully.',
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Assign Product to Category
   * POST /api/v1/categories/assign
   */
  assignProduct: async (req, res, next) => {
    try {
      const { productId, categoryName } = req.body;
      const updated = await categoryModel.assignProduct(productId, categoryName);
      return res.status(200).json({
        success: true,
        message: 'Product assigned to category successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = categoryController;
