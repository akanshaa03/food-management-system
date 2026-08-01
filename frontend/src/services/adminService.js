import api from './api';

/**
 * Super Admin Service Methods
 */
export const adminService = {
  getPlatformAnalytics: async () => {
    const response = await api.get('/admin/platform-analytics');
    return response.data;
  },

  getUsersList: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  approveUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/approve`);
    return response.data;
  },

  rejectUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/reject`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/activate`);
    return response.data;
  },

  suspendUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/suspend`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getAllDonations: async () => {
    const response = await api.get('/admin/all-donations');
    return response.data;
  },

  getAllPickups: async () => {
    const response = await api.get('/admin/all-pickups');
    return response.data;
  },
};
