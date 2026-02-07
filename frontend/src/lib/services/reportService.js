import api from '../api.js';

export const reportService = {
  /**
   * Get dashboard stats (Admin only)
   * GET /api/reports/dashboard-stats
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/reports/dashboard-stats');
      return response.data.data || response.data || {
        totalProducts: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingInvoices: 0
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        totalProducts: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        pendingInvoices: 0
      };
    }
  },

  /**
   * Get chart data for dashboard (Admin only)
   * GET /api/reports/chart-data
   */
  getChartData: async () => {
    try {
      const response = await api.get('/api/reports/chart-data');
      return response.data.data || {
        revenueTrend: [],
        subscriptionDistribution: [],
        topProducts: []
      };
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      return {
        revenueTrend: [],
        subscriptionDistribution: [],
        topProducts: []
      };
    }
  }
};
