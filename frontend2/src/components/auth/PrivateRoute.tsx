import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import type { UserRole } from '@/types'

interface PrivateRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

/**
 * Maps user role and position to effective role for access control
 * - role "user" + position "nhân viên" → "employee"
 * - role "user" + position "trưởng phòng" → "manager"
 * - role "user" + position "kỹ thuật viên" → "technician"
 * - role "admin" → "admin"
 * - Otherwise, returns the original role
 */
function getEffectiveRole(role: string, position?: string): UserRole {
  const roleLower = role.toLowerCase()
  const positionLower = position?.toLowerCase() || ''

  // Admin role stays as admin
  if (roleLower === 'admin') {
    return 'admin'
  }

  // Map user role with position to effective role
  if (roleLower === 'user' && positionLower) {
    if (positionLower === 'nhân viên') {
      return 'employee'
    }
    if (positionLower === 'trưởng phòng') {
      return 'manager'
    }
    if (positionLower === 'kỹ thuật viên') {
      return 'technician'
    }
  }

  // Fall back to original role (case-insensitive)
  return roleLower as UserRole
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access (case-insensitive)
  if (allowedRoles && user) {
    const effectiveRole = getEffectiveRole(user.role, user.position)
    if (!allowedRoles.includes(effectiveRole)) {
      // User doesn't have the required role
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
