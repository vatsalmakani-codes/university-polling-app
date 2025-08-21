import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // --- CRITICAL CHANGE: Start isLoading as true ---
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

  const loadUser = useCallback(async (isInitialLoad = false) => {
    // Only set loading to true on refetches, not the very first load
    if (!isInitialLoad) {
      setIsLoading(true);
    }
    
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
    } else {
      // If no token, we know they're not authenticated
      setIsAuthenticated(false);
      setUser(null);
    }
    // This is the most important part. isLoading is only set to false
    // after the entire check is complete.
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Pass true for the initial load
    loadUser(true);
  }, [loadUser]);

  const login = async (email, password, role) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, role });
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      setAuthToken(res.data.token);
      await loadUser();
      return true;
    } catch (err) {
      return false;
    }
  };
  
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};