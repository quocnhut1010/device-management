import api from './api'
import type { UserDto, RegisterUserDto } from '@/types'

// Get all users
export const getUsers = (isDeleted?: boolean) => 
  api.get<UserDto[]>('/Users', { params: isDeleted !== undefined ? { isDeleted } : {} })

// Get user by ID
export const getUserById = (id: string) => 
  api.get<UserDto>(`/Users/${id}`)

// Get current user profile
export const getUserProfile = () => 
  api.get<UserDto>('/Users/profile')

// Create new user
export const createUser = (data: RegisterUserDto) => 
  api.post<UserDto>('/Users', data)

// Update user
export const updateUser = (id: string, data: UserDto) => 
  api.put<UserDto>(`/Users/${id}`, data)

// Update user profile
export const updateUserProfile = (data: UserDto) => 
  api.put<UserDto>('/Users/profile', data)

// Delete user (soft delete)
export const deleteUser = (id: string) => 
  api.delete(`/Users/${id}`)

// Restore deleted user
export const restoreUser = (id: string) => 
  api.put(`/Users/${id}/restore`)

// Get all users data
export const getAllUsersData = async (includeDeleted: boolean = true): Promise<UserDto[]> => {
  const res = await api.get<UserDto[]>('/Users', {
    params: includeDeleted ? {} : { isDeleted: false },
  })
  return res.data
}

// Get users by department
export const getUsersByDepartment = async (departmentId: string): Promise<UserDto[]> => {
  const res = await api.get<UserDto[]>(`/Users/department/${departmentId}`)
  return res.data
}

// User service object
export const userService = {
  getUsers,
  getUserById,
  getUserProfile,
  createUser,
  updateUser,
  updateUserProfile,
  deleteUser,
  restoreUser,
  getAllUsersData,
  getUsersByDepartment,
}
