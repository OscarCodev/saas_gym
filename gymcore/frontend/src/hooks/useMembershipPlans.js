import { useState, useEffect, useCallback } from 'react';
import membershipPlansService from '../services/membershipPlans.service';

export const useMembershipPlans = (includeInactive = false) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipPlansService.getAll(includeInactive);
      setPlans(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los planes');
      console.error('Error fetching membership plans:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = async (planData) => {
    try {
      const newPlan = await membershipPlansService.create(planData);
      setPlans(prev => [newPlan, ...prev]);
      return newPlan;
    } catch (err) {
      throw err;
    }
  };

  const updatePlan = async (planId, planData) => {
    try {
      const updatedPlan = await membershipPlansService.update(planId, planData);
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      return updatedPlan;
    } catch (err) {
      throw err;
    }
  };

  const deletePlan = async (planId) => {
    try {
      await membershipPlansService.delete(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      throw err;
    }
  };

  const toggleStatus = async (planId) => {
    try {
      const updatedPlan = await membershipPlansService.toggleStatus(planId);
      setPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      return updatedPlan;
    } catch (err) {
      throw err;
    }
  };

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    toggleStatus
  };
};

export default useMembershipPlans;
