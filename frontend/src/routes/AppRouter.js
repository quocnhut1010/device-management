import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// Pages
import Welcome from '../pages/Welcome';
import Login from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized'; // ✅ chỉ dùng file này
import DevicePage from '../pages/DevicePage';
import UserPage from '../pages/UserPage';
import DepartmentPage from '../pages/DepartmentPage';
import SupplierPage from '../pages/SupplierPage';
// Layout & Routes
import PrivateRoute from '../components/auth/PrivateRoute';
import AppLayout from '../components/layout/AppLayout';
import DeviceTypePage from '../pages/DeviceTypePage';
const AppRoutes = () => {
    return (_jsx(Router, { children: _jsx(AnimatePresence, { mode: "wait", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Welcome, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/unauthorized", element: _jsx(Unauthorized, {}) }), _jsxs(Route, { path: "/", element: _jsx(AppLayout, {}), children: [_jsx(Route, { path: "dashboard", element: _jsx(PrivateRoute, { allowedRoles: ['Admin', 'User'], children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "devices", element: _jsx(PrivateRoute, { allowedRoles: ['Admin', 'User'], children: _jsx(DevicePage, {}) }) }), _jsx(Route, { path: "users", element: _jsx(PrivateRoute, { allowedRoles: ['Admin'], children: _jsx(UserPage, {}) }) }), _jsx(Route, { path: "suppliers", element: _jsx(PrivateRoute, { allowedRoles: ['Admin'], children: _jsx(SupplierPage, {}) }) }), _jsx(Route, { path: "departments", element: _jsx(PrivateRoute, { allowedRoles: ['Admin', 'User'], children: _jsx(DepartmentPage, {}) }) }), _jsx(Route, { path: "/device-types", element: _jsx(PrivateRoute, { allowedRoles: ['Admin'], children: _jsx(DeviceTypePage, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Unauthorized, {}) })] }) }) }));
};
export default AppRoutes;
