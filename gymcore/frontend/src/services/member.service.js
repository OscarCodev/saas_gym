import api from './api';

const getMembers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.skip) params.append('skip', filters.skip);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const response = await api.get(`/members/?${params.toString()}`);
  return response.data;
};

const createMember = async (data) => {
  const response = await api.post('/members/', data);
  return response.data;
};

const updateMember = async (id, data) => {
  const response = await api.put(`/members/${id}`, data);
  return response.data;
};

const deleteMember = async (id) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

const suspendMember = async (id) => {
  const response = await api.patch(`/members/${id}/suspend`);
  return response.data;
};

const activateMember = async (id) => {
  const response = await api.patch(`/members/${id}/activate`);
  return response.data;
};

// Alias for getAll - used in reports
const getAll = async (gymId) => {
  return getMembers({ limit: 1000 }); // Get all members (up to 1000)
};

export default {
  getMembers,
  getAll,
  createMember,
  updateMember,
  deleteMember,
  suspendMember,
  activateMember
};