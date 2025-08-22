import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <Spinner fullscreen />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};
export default PublicRoute;