import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const body = JSON.stringify({ email, password });
    try {
      const res = await axios.post('/api/auth/login', body, config);
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      console.error(err.response.data);
      return false;
    }
  };

  const register = async ({ name, email, password, role }) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    const body = JSON.stringify({ name, email, password, role });
    try {
      const res = await axios.post('/api/auth/register', body, config);
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      console.error(err.response.data);
      return false;
    }
  };
  
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};