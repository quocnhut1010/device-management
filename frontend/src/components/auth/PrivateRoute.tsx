// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth'
import type { JSX } from 'react';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/unauthorized" replace />;
};

export default PrivateRoute;
