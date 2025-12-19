import api, { setAuthToken, clearAuthToken } from './api';

const registerGym = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, user, gym } = response.data;
  
  setAuthToken(access_token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('gym', JSON.stringify(gym));
  
  return { user, gym };
};

const logout = () => {
  clearAuthToken();
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  const gymStr = localStorage.getItem('gym');
  
  if (userStr && gymStr) {
    return {
      user: JSON.parse(userStr),
      gym: JSON.parse(gymStr)
    };
  }
  return null;
};

export default {
  registerGym,
  login,
  logout,
  getCurrentUser
};