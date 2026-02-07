import api from '../api.js';

export const planService = {
  /**
   * Get all plans
   * GET /api/plans
   * @param {Object} params - Optional query params
   * @param {number} params.productId - Filter by product ID
   */
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.productId) queryParams.set('productId', params.productId);
      const queryString = queryParams.toString();
      const url = queryString ? `/api/plans?${queryString}` : '/api/plans';
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data || response.data.plans || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch plans',
        data: [],
      };
    }
  },

  /**
   * Get plan by ID
   * GET /api/plans/:id
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/plans/${id}`);
      return {
        success: true,
        data: response.data.data || response.data.plan || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch plan',
        data: null,
      };
    }
  },

  /**
   * Create new plan
   * POST /api/plans
   */
  create: async (planData) => {
    try {
      const response = await api.post('/api/plans', planData);
      return {
        success: true,
        data: response.data.plan || response.data,
        message: 'Plan created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create plan',
      };
    }
  },

  /**
   * Update plan
   * PUT /api/plans/:id
   */
  update: async (id, planData) => {
    try {
      const response = await api.put(`/api/plans/${id}`, planData);
      return {
        success: true,
        data: response.data.plan || response.data,
        message: 'Plan updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update plan',
      };
    }
  },

  /**
   * Delete plan
   * DELETE /api/plans/:id
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/plans/${id}`);
      return {
        success: true,
        message: 'Plan deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete plan',
      };
    }
  },
};

export default planService;
