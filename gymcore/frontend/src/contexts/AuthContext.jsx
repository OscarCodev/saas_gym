import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser.user);
      setGym(currentUser.gym);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setGym(data.gym);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setGym(null);
    setIsAuthenticated(false);
  };

  const register = async (data) => {
    try {
      return await authService.registerGym(data);
    } catch (error) {
      throw error;
    }
  };

  const updateGymStatus = (isActive) => {
    if (gym) {
      const updatedGym = { ...gym, is_active: isActive };
      setGym(updatedGym);
      localStorage.setItem('gym', JSON.stringify(updatedGym));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      gym, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      register,
      updateGymStatus,
      setUser,
      setGym
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);