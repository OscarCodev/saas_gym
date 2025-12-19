import api from './api';

export const membershipPlansService = {
  // Get all membership plans for the gym
  getAll: async (includeInactive = false) => {
    const response = await api.get(`/membership-plans?include_inactive=${includeInactive}`);
    return response.data;
  },

  // Get a specific membership plan
  getById: async (planId) => {
    const response = await api.get(`/membership-plans/${planId}`);
    return response.data;
  },

  // Create a new membership plan
  create: async (planData) => {
    const response = await api.post('/membership-plans', planData);
    return response.data;
  },

  // Update an existing membership plan
  update: async (planId, planData) => {
    const response = await api.put(`/membership-plans/${planId}`, planData);
    return response.data;
  },

  // Delete a membership plan
  delete: async (planId) => {
    await api.delete(`/membership-plans/${planId}`);
  },

  // Toggle plan active status
  toggleStatus: async (planId) => {
    const response = await api.patch(`/membership-plans/${planId}/toggle-status`);
    return response.data;
  }
};

export default membershipPlansService;
