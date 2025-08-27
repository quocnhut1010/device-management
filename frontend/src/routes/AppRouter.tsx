// src/routes/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Welcome from '../pages/Welcome';
import Login from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import PrivateRoute from '../components/auth/PrivateRoute';
import AppLayout from '../components/layout/AppLayout';
import DevicePage from '../pages/DevicePage';
import UserPage from '../pages/UserPage';
import DepartmentPage from '../pages/DepartmentPage';

const AppRoutes = () => {
  return (
    <Router>
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* AppLayout luôn hiển thị, nhưng từng page con mới cần auth */}
        <Route path="/" element={<AppLayout />}>
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
         <Route
          path="devices"
          element={
            <PrivateRoute>
              <DevicePage />
            </PrivateRoute>
          }
        />
        <Route
          path="users"
          element={
            <PrivateRoute>
              <UserPage />
            </PrivateRoute>
          }
        />
        <Route path="/departments" element={<DepartmentPage />} />
        </Route>

        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </AnimatePresence>
  </Router>
  );
};

export default AppRoutes;
