import api from '../api';

export const notificationService = {
  async getAll(params = {}) {
    try {
      const response = await api.get('/api/notifications', { params });
      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch notifications',
        data: [],
      };
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get('/api/notifications/unread-count');
      return {
        success: true,
        data: response.data.data || { count: 0 },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch unread count',
        data: { count: 0 },
      };
    }
  },

  async markRead(id) {
    try {
      const response = await api.post(`/api/notifications/${id}/read`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to mark as read',
      };
    }
  },

  async markAllRead() {
    try {
      const response = await api.post('/api/notifications/read-all');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to mark all as read',
      };
    }
  },
};
