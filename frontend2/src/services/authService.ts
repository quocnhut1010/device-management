import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import type { LoginDto, TokenPayload } from '@/types'
import api from './api'

const API_URL = 'http://localhost:5264/api'

export interface LoginResponse {
  token: string
}

// Get access token from localStorage
export function getAccessToken(): string | null {
  return localStorage.getItem('token')
}

// Login function
export const login = async (email: string, password: string): Promise<string> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/Auth/login`, { email, password })
  const token = response.data.token
  localStorage.setItem('token', token)
  return token
}

// Logout function
export const logout = () => {
  localStorage.removeItem('token')
}

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

// Decode JWT token to get user info
export function getUserFromToken(): TokenPayload | null {
  const token = getAccessToken()
  if (!token) return null

  try {
    const payload: TokenPayload = jwtDecode(token)
    return payload
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

// Get user role from token
export const getUserRole = (): string | null => {
  const user = getUserFromToken()
  return user?.role || null
}

// Forgot password function
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/Auth/forgot-password', { email })
  return response.data
}

// Reset password function
export const resetPassword = async (token: string, email: string, newPassword: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/Auth/reset-password', {
    token,
    email,
    newPassword,
  })
  return response.data
}

// Change password function (when user is logged in)
export const changePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/Auth/change-password', {
    oldPassword,
    newPassword,
    confirmPassword,
  })
  return response.data
}

// Auth service object (for compatibility)
export const authService = {
  login,
  logout,
  getToken,
  getUserFromToken,
  isAuthenticated,
  getUserRole,
  forgotPassword,
  resetPassword,
  changePassword,
}
