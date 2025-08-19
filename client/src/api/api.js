// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // The proxy will handle the domain
  headers: {
    'Content-Type': 'application/json'
  }
});

// This is an interceptor. It runs before every request.
// It will add the JWT token to the header if it exists.
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // Note the header name matches our middleware: 'x-auth-token'
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;