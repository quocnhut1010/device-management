import { jsx as _jsx } from "react/jsx-runtime";
// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/auth';
const PrivateRoute = ({ children, allowedRoles }) => {
    const loggedIn = isAuthenticated();
    const role = getUserRole();
    if (!loggedIn) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return _jsx(Navigate, { to: "/unauthorized", replace: true });
    }
    // Nếu role là null và có allowedRoles, redirect về login
    if (allowedRoles && !role) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return children;
};
export default PrivateRoute;
