import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getUserFromToken, getToken, login as authLogin, logout as authLogout } from '@/services/authService'
import type { TokenPayload } from '@/types'

interface AuthContextType {
  user: TokenPayload | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TokenPayload | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    const storedToken = getToken()
    const userData = getUserFromToken()
    
    if (storedToken && userData) {
      setToken(storedToken)
      setUser(userData)
    }
    setIsLoading(false)
  }, [])

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        const newToken = e.newValue
        if (newToken) {
          // Token added/changed
          const userData = getUserFromToken()
          if (userData) {
            setToken(newToken)
            setUser(userData)
          }
        } else {
          // Token removed
          setToken(null)
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)

    try {
      const newToken = await authLogin(email, password)
      const userData = getUserFromToken()
      
      if (userData) {
        setToken(newToken)
        setUser(userData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authLogout()
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export default AuthContext
