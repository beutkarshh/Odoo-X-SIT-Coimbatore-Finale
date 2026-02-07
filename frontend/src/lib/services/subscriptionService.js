import api from '../api.js';

export const subscriptionService = {
  /**
   * Get all subscriptions (filtered by role on backend)
   * GET /api/subscriptions
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/subscriptions');
      return {
        success: true,
        data: response.data.data || response.data.subscriptions || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch subscriptions',
        data: [],
      };
    }
  },

  /**
   * Get subscription by ID
   * GET /api/subscriptions/:id
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/subscriptions/${id}`);
      return {
        success: true,
        data: response.data.data || response.data.subscription || null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch subscription',
        data: null,
      };
    }
  },

  /**
   * Create new subscription (Admin/Internal only)
   * POST /api/subscriptions
   */
  create: async (subscriptionData) => {
    try {
      const response = await api.post('/api/subscriptions', subscriptionData);
      return {
        success: true,
        data: response.data.data || response.data.subscription || null,
        message: 'Subscription created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create subscription',
      };
    }
  },

  /**
   * Update subscription status (Admin/Internal only)
   * PATCH /api/subscriptions/:id/status
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/subscriptions/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data || response.data.subscription || null,
        message: 'Subscription status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update subscription status',
      };
    }
  },
};

export default subscriptionService;
