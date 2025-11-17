import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'

// Lazy load pages for better performance
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const DevicesPage = lazy(() => import('@/pages/DevicesPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const DepartmentsPage = lazy(() => import('@/pages/DepartmentsPage'))
const SuppliersPage = lazy(() => import('@/pages/SuppliersPage'))
const DeviceTypesPage = lazy(() => import('@/pages/DeviceTypesPage'))
const DeviceModelsPage = lazy(() => import('@/pages/DeviceModelsPage'))
const AssignmentsPage = lazy(() => import('@/pages/AssignmentsPage'))
const DeviceHistoryPage = lazy(() => import('@/pages/DeviceHistoryPage'))
const IncidentsPage = lazy(() => import('@/pages/IncidentsPage'))
const RepairsPage = lazy(() => import('@/pages/RepairsPage'))
const ReplacementsPage = lazy(() => import('@/pages/ReplacementsPage'))
const LiquidationsPage = lazy(() => import('@/pages/LiquidationsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const MyDevicesPage = lazy(() => import('@/pages/MyDevicesPage'))
const MyIncidentsPage = lazy(() => import('@/pages/MyIncidentsPage'))
const WorkQueuePage = lazy(() => import('@/pages/WorkQueuePage'))

// Layout components
import AppLayout from '@/components/layout/AppLayout'
import PrivateRoute from '@/components/auth/PrivateRoute'

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner />
  </div>
)

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected routes with layout */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          {/* Default route */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Device routes - Admin, Manager, and User (Employee) */}
          <Route path="devices" element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'user', 'employee']}>
              <DevicesPage />
            </PrivateRoute>
          } />
          <Route path="users" element={
            <PrivateRoute allowedRoles={['admin']}>
              <UsersPage />
            </PrivateRoute>
          } />
          <Route path="departments" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <DepartmentsPage />
            </PrivateRoute>
          } />
          <Route path="suppliers" element={
            <PrivateRoute allowedRoles={['admin']}>
              <SuppliersPage />
            </PrivateRoute>
          } />
          <Route path="device-types" element={
            <PrivateRoute allowedRoles={['admin']}>
              <DeviceTypesPage />
            </PrivateRoute>
          } />
          <Route path="device-models" element={
            <PrivateRoute allowedRoles={['admin']}>
              <DeviceModelsPage />
            </PrivateRoute>
          } />
          <Route path="assignments" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AssignmentsPage />
            </PrivateRoute>
          } />
          <Route path="device-history" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <DeviceHistoryPage />
            </PrivateRoute>
          } />
          <Route path="device-history/:deviceId" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <DeviceHistoryPage />
            </PrivateRoute>
          } />
          
          {/* Incident & Repair Management */}
          <Route path="incidents" element={
            <PrivateRoute allowedRoles={['admin', 'manager', 'employee']}>
              <IncidentsPage />
            </PrivateRoute>
          } />
          <Route path="repairs" element={
            <PrivateRoute allowedRoles={['admin', 'technician']}>
              <RepairsPage />
            </PrivateRoute>
          } />
          <Route path="replacements" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <ReplacementsPage />
            </PrivateRoute>
          } />
          <Route path="liquidations" element={
            <PrivateRoute allowedRoles={['admin']}>
              <LiquidationsPage />
            </PrivateRoute>
          } />
          
          {/* Reports & Analytics */}
          <Route path="reports" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <ReportsPage />
            </PrivateRoute>
          } />
          <Route path="analytics" element={
            <PrivateRoute allowedRoles={['admin', 'manager']}>
              <AnalyticsPage />
            </PrivateRoute>
          } />
          
          {/* Notifications */}
          <Route path="notifications" element={
            <PrivateRoute allowedRoles={['admin']}>
              <NotificationsPage />
            </PrivateRoute>
          } />
          
          {/* User specific pages */}
          <Route path="my-devices" element={
            <PrivateRoute allowedRoles={['employee']}>
              <MyDevicesPage />
            </PrivateRoute>
          } />
          <Route path="my-incidents" element={
            <PrivateRoute allowedRoles={['employee']}>
              <MyIncidentsPage />
            </PrivateRoute>
          } />
          <Route path="work-queue" element={
            <PrivateRoute allowedRoles={['technician']}>
              <WorkQueuePage />
            </PrivateRoute>
          } />
          
          {/* Settings */}
          <Route path="settings" element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
