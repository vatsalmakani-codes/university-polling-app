import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner'; // It's better to show a spinner during the check

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // While the auth status is being checked, show a spinner to avoid flashes
  if (isLoading) {
    return <Spinner fullscreen />;
  }

  // If the user IS authenticated, redirect them away from this public page
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // If the user is NOT authenticated, show the page (e.g., Login or Register)
  return children;
};

export default PublicRoute;