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
import DeviceModelPage from '../pages/DeviceModelPage';
import DeviceAssignmentPage from '../pages/DeviceAssignmentPage';
import DepartmentDevicesPage from '../pages/DepartmentDevicesPage';
import IncidentReportPage from '../pages/IncidentReportPage';
import RepairManagementPage from '../pages/RepairManagementPage';
import ReplacementPage from '../pages/ReplacementPage';
import LiquidationPage from '../pages/LiquidationPage';

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
            <Route
              path="/device-models"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <DeviceModelPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/assignments"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <DeviceAssignmentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/department-devices"
              element={
                <PrivateRoute allowedRoles={['User']} allowedPositions={['Trưởng phòng']}>
                  <DepartmentDevicesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="incidents"
              element={
                <PrivateRoute allowedRoles={['Admin']} allowedPositions={['Nhân viên', 'Trưởng phòng']} requireBoth={false}>
                  <IncidentReportPage />
                </PrivateRoute>
              }
            />
            <Route
              path="repairs"
              element={
                <PrivateRoute allowedRoles={['Admin']} allowedPositions={['Kỹ thuật viên']} requireBoth={false}>
                  <RepairManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="replacements"
              element={
                <PrivateRoute allowedRoles={['Admin', 'User']}>
                  <ReplacementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="liquidation"
              element={
                <PrivateRoute allowedRoles={['Admin']}>
                  <LiquidationPage />
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
