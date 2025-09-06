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
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes with layout */}
          <Route path="/" element={<AppLayout />}>
            <Route
              path="dashboard"
              element={
                <PrivateRoute allowedRoles={['Admin', 'User']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="devices"
              element={
                <PrivateRoute allowedRoles={['Admin', 'User']}>
                  <DevicePage />
                </PrivateRoute>
              }
            />
            <Route
              path="users"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <UserPage />
                </PrivateRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <SupplierPage />
                </PrivateRoute>
              }
            />
            <Route
              path="departments"
              element={
                <PrivateRoute allowedRoles={['Admin', 'User']}>
                  <DepartmentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/device-types"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <DeviceTypePage />
                </PrivateRoute>
              }
            />
          </Route>
          

          {/* fallback */}
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default AppRoutes;
