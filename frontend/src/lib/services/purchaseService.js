import api from '../api.js';

export const purchaseService = {
  /**
   * Purchase a subscription plan (Portal users only)
   * POST /api/purchase
   */
  purchasePlan: async ({ planId, productId, paymentMethod }) => {
    try {
      const response = await api.post('/api/purchase', {
        planId,
        productId,
        paymentMethod,
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Purchase completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to complete purchase',
      };
    }
  },
};
