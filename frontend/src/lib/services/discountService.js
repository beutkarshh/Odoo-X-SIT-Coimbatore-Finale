import api from '../api';

/**
 * Discount Service
 * Handles all API calls related to discounts
 */

export const discountService = {
  /**
   * Get all discounts
   */
  async getAll() {
    try {
      const response = await api.get('/api/discounts');
      return {
        success: true,
        data: response.data.data || response.data.discounts || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch discounts',
        data: [],
      };
    }
  },

  /**
   * Get only active discounts (within date range and active status)
   */
  async getActive() {
    try {
      const response = await api.get('/api/discounts/active');
      return {
        success: true,
        data: response.data.data || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch active discounts',
        data: [],
      };
    }
  },

  /**
   * Get a single discount by ID
   */
  async getById(id) {
    try {
      const response = await api.get(`/api/discounts/${id}`);
      return {
        success: true,
        data: response.data.discount || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch discount',
        data: null,
      };
    }
  },

  /**
   * Create a new discount
   */
  async create(discountData) {
    try {
      const response = await api.post('/api/discounts', discountData);
      return {
        success: true,
        data: response.data.discount || response.data,
        message: 'Discount created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create discount',
      };
    }
  },

  /**
   * Update an existing discount
   */
  async update(id, discountData) {
    try {
      const response = await api.put(`/api/discounts/${id}`, discountData);
      return {
        success: true,
        data: response.data.discount || response.data,
        message: 'Discount updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update discount',
      };
    }
  },

  /**
   * Delete a discount
   */
  async delete(id) {
    try {
      const response = await api.delete(`/api/discounts/${id}`);
      return {
        success: true,
        message: 'Discount deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete discount',
      };
    }
  },

  /**
   * Validate a coupon code
   * POST /api/discounts/validate-coupon
   */
  async validateCoupon(couponCode, amount) {
    try {
      const response = await api.post('/api/discounts/validate-coupon', {
        couponCode,
        amount,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Invalid coupon code',
        data: null,
      };
    }
  },

  /**
   * Get available coupons for display
   * GET /api/discounts/available-coupons
   */
  async getAvailableCoupons() {
    try {
      const response = await api.get('/api/discounts/available-coupons');
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coupons',
        data: [],
      };
    }
  },
};
