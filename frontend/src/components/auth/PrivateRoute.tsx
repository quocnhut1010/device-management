// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/auth';
import type { JSX } from 'react';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const loggedIn = isAuthenticated();
  const role = getUserRole();

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Nếu role là null và có allowedRoles, redirect về login
  if (allowedRoles && !role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
