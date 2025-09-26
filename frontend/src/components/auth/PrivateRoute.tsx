// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole, getUserFromToken } from '../../services/auth';
import type { JSX } from 'react';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
  allowedPositions?: string[];
  requireBoth?: boolean; // Nếu true thì yêu cầu cả role và position, nếu false thì chỉ cần 1 trong 2
}

const PrivateRoute = ({ children, allowedRoles, allowedPositions, requireBoth = false }: PrivateRouteProps) => {
  const loggedIn = isAuthenticated();
  const role = getUserRole();
  const user = getUserFromToken();
  const position = user?.position;

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Nếu không có giới hạn gì, cho phép truy cập
  if (!allowedRoles && !allowedPositions) {
    return children;
  }

  const hasValidRole = !allowedRoles || (role && allowedRoles.includes(role));
  const hasValidPosition = !allowedPositions || (position && allowedPositions.includes(position));

  if (requireBoth) {
    // Logic AND: Cần cả role và position hợp lệ
    if (!hasValidRole || !hasValidPosition) {
      return <Navigate to="/unauthorized" replace />;
    }
  } else {
    // Logic OR: Chỉ cần một trong hai hợp lệ
    if (!hasValidRole && !hasValidPosition) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Nếu có yêu cầu về role nhưng không có role, và cũng không có position hợp lệ
    if (allowedRoles && !role && !hasValidPosition) {
      return <Navigate to="/login" replace />;
    }
    
    // Nếu có yêu cầu về position nhưng không có position, và cũng không có role hợp lệ
    if (allowedPositions && !position && !hasValidRole) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
