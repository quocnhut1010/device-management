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

  // 1) Chưa đăng nhập → buộc login
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 2) Không cấu hình giới hạn → cho qua
  if (!allowedRoles && !allowedPositions) {
    return children;
  }

  // 3) Tính quyền
  const hasRole = Boolean(role) && (allowedRoles ? allowedRoles.includes(role!) : false);
  const hasPosition = Boolean(position) && (allowedPositions ? allowedPositions.includes(position!) : false);

  // 4) Chỉ cấu hình role
  if (allowedRoles && !allowedPositions) {
    return hasRole ? children : <Navigate to="/unauthorized" replace />;
  }

  // 5) Chỉ cấu hình position
  if (!allowedRoles && allowedPositions) {
    return hasPosition ? children : <Navigate to="/unauthorized" replace />;
  }

  // 6) Cấu hình cả role & position
  if (requireBoth) {
    // AND
    return hasRole && hasPosition ? children : <Navigate to="/unauthorized" replace />;
  } else {
    // OR
    return (hasRole || hasPosition) ? children : <Navigate to="/unauthorized" replace />;
  }
};

export default PrivateRoute;
