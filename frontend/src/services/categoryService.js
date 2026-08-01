import api from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, updateData) => {
    const response = await api.put(`/categories/${id}`, updateData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  assignProduct: async (productId, categoryName) => {
    const response = await api.post('/categories/assign', { productId, categoryName });
    return response.data;
  },
};
