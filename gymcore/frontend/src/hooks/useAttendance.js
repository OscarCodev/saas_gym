import { useState, useCallback } from 'react';
import attendanceService from '../services/attendance.service';

const useAttendance = () => {
  const [todayAttendances, setTodayAttendances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkIn = useCallback(async (dni) => {
    setLoading(true);
    setError(null);
    try {
      const attendance = await attendanceService.checkIn(dni);
      // Refresh list after check-in
      const data = await attendanceService.getTodayAttendances();
      setTodayAttendances(data);
      return attendance;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Error al registrar asistencia';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayAttendances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getTodayAttendances();
      console.log('Attendances data received:', data);
      setTodayAttendances(data);
    } catch (err) {
      console.error('Error fetching attendances:', err);
      setError(err.response?.data?.detail || 'Error al cargar asistencias');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  const getMemberAttendances = useCallback(async (memberId, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getMemberAttendances(memberId, limit);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar historial');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    todayAttendances,
    stats,
    loading,
    error,
    checkIn,
    fetchTodayAttendances,
    fetchStats,
    getMemberAttendances
  };
};

export default useAttendance;
