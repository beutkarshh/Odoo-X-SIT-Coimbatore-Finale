import api from '../api.js';

export const userService = {
  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/users');
      // Backend returns: { success: true, data: { page, pageSize, total, items: [...] } }
      const result = response.data.data || response.data;
      return {
        success: true,
        data: result.items || result || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch users',
        data: [],
      };
    }
  },

  /**
   * Create new user (Admin only)
   * POST /api/users
   */
  create: async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      // Backend returns: { success: true, data: user }
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'User created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create user',
      };
    }
  },
};

export default userService;
