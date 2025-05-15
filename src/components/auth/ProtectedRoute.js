import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute state:', {
      loading,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      requiredRole,
      currentPath: location.pathname
    });
  }, [loading, isAuthenticated, user, requiredRole, location]);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Loading state');
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login', {
      isAuthenticated,
      hasUser: !!user,
      currentPath: location.pathname
    });
    
    // Store the current path for redirect after login
    if (location.pathname !== '/login') {
      sessionStorage.setItem('redirectPath', location.pathname);
    }
    
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If role is required and user's role doesn't match
  if (requiredRole) {
    const userRole = user.role?.toLowerCase();
    const requiredRoleLower = requiredRole.toLowerCase();

    if (!userRole || userRole !== requiredRoleLower) {
      console.log('ProtectedRoute: Invalid role access attempt', {
        userRole,
        requiredRole: requiredRoleLower,
        currentPath: location.pathname
      });
      return <Navigate to={`/${userRole}`} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute; 