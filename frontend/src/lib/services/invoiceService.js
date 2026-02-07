import api from '../api.js';

export const invoiceService = {
  /**
   * Get all invoices (filtered by role on backend)
   * GET /api/invoices
   */
  getAll: async () => {
    try {
      const response = await api.get('/api/invoices');
      return {
        success: true,
        data: response.data.data || response.data.invoices || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch invoices',
        data: [],
      };
    }
  },

  /**
   * Get invoice by ID
   * GET /api/invoices/:id
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/api/invoices/${id}`);
      return {
        success: true,
        data: response.data.data || response.data.invoice || null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch invoice',
        data: null,
      };
    }
  },

  /**
   * Generate invoice for subscription (Admin/Internal only)
   * POST /api/invoices/generate
   */
  generate: async (subscriptionId) => {
    try {
      const response = await api.post('/api/invoices/generate', { subscriptionId });
      return {
        success: true,
        data: response.data.data || response.data.invoice || null,
        message: 'Invoice generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to generate invoice',
      };
    }
  },

  /**
   * Update invoice status (Admin/Internal only)
   * PATCH /api/invoices/:id/status
   */
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/invoices/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data || response.data.invoice || null,
        message: 'Invoice status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update invoice status',
      };
    }
  },
};

export default invoiceService;
