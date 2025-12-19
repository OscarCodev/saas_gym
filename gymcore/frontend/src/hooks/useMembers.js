import { useState, useCallback } from 'react';
import memberService from '../services/member.service';

const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await memberService.getMembers(filters);
      setMembers(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar socios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = async (data) => {
    try {
      const newMember = await memberService.createMember(data);
      setMembers(prev => [newMember, ...prev]);
      return newMember;
    } catch (err) {
      throw err;
    }
  };

  const updateMember = async (id, data) => {
    try {
      const updatedMember = await memberService.updateMember(id, data);
      setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      return updatedMember;
    } catch (err) {
      throw err;
    }
  };

  const deleteMember = async (id) => {
    try {
      await memberService.deleteMember(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const suspendMember = async (id) => {
    try {
      const updatedMember = await memberService.suspendMember(id);
      setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      return updatedMember;
    } catch (err) {
      throw err;
    }
  };

  const activateMember = async (id) => {
    try {
      const updatedMember = await memberService.activateMember(id);
      setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      return updatedMember;
    } catch (err) {
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    suspendMember,
    activateMember
  };
};

export default useMembers;