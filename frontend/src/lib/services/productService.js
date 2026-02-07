import api from '../api.js';

export const productService = {
  /**
   * Get all products
   * GET /api/products
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/products');
      return {
        success: true,
        data: response.data.data || response.data.products || response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch products',
        data: [],
      };
    }
  },

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return {
        success: true,
        data: response.data.data || response.data.product || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch product',
        data: null,
      };
    }
  },

  /**
   * Create new product
   * POST /api/products
   */
  create: async (productData) => {
    try {
      const response = await api.post('/api/products', productData);
      return {
        success: true,
        data: response.data.product || response.data,
        message: 'Product created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create product',
      };
    }
  },

  /**
   * Update product
   * PUT /api/products/:id
   */
  update: async (id, productData) => {
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      return {
        success: true,
        data: response.data.product || response.data,
        message: 'Product updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update product',
      };
    }
  },

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/products/${id}`);
      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to delete product',
      };
    }
  },
};

export default productService;
