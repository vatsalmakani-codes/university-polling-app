import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <Spinner fullscreen text="Verifying Access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // CRITICAL FIX: Wait for the user object itself to be loaded before checking roles.
  // This prevents a race condition on page refresh.
  if (roles && !user) {
      return <Spinner fullscreen text="Loading User Data..." />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};
export default PrivateRoute;