import axios from 'axios';

const API_URL = 'http://localhost:4000/api/reports';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reportService = {
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/dashboard-stats`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};
