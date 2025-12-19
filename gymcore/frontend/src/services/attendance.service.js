import api from './api';

const attendanceService = {
  checkIn: async (dni) => {
    const response = await api.post('/attendance/check-in', { dni });
    return response.data;
  },

  getTodayAttendances: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  getAttendancesByRange: async (days) => {
    const response = await api.get('/attendance/range', {
      params: { days }
    });
    return response.data;
  },

  getMemberAttendances: async (memberId, limit = 10) => {
    const response = await api.get(`/attendance/member/${memberId}`, {
      params: { limit }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  }
};

export default attendanceService;
