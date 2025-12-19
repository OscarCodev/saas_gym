import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboard.service';

const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsData, activityData, revenueChartData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(),
        dashboardService.getRevenueChart()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
      setRevenueData(revenueChartData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    recentActivity,
    revenueData,
    loading,
    error,
    refresh: fetchDashboardData
  };
};

export default useDashboardStats;