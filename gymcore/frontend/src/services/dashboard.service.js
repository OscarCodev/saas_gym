import api from './api';

const getStats = async (gymId) => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

const getRecentActivity = async () => {
  const response = await api.get('/dashboard/recent-activity');
  return response.data;
};

const getRevenueChart = async () => {
  const response = await api.get('/dashboard/revenue-chart');
  return response.data;
};

// Alias for reports page compatibility
const getRevenueData = async (gymId) => {
  return getRevenueChart();
};

export default {
  getStats,
  getRecentActivity,
  getRevenueChart,
  getRevenueData
};