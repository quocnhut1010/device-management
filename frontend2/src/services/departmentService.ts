import api from './api'
import type { DepartmentDto } from '@/types'

// Get all departments (role-based: Admin sees all, User sees only their department)
export const getAllDepartments = (isDeleted?: boolean) => {
  const params = isDeleted !== undefined ? { isDeleted } : {}
  return api.get<DepartmentDto[]>('/Departments', { params })
}

// Get department by ID
export const getDepartmentById = (id: string) =>
  api.get<DepartmentDto>(`/Departments/${id}`)

// Create department (Admin only)
export const createDepartment = (data: Partial<DepartmentDto>) =>
  api.post<DepartmentDto>('/Departments', data)

// Update department (Admin only)
export const updateDepartment = (id: string, data: Partial<DepartmentDto>) =>
  api.put<DepartmentDto>(`/Departments/${id}`, data)

// Delete department (Admin only, soft delete)
export const deleteDepartment = (id: string) =>
  api.delete(`/Departments/${id}`)

// Restore department (Admin only)
export const restoreDepartment = (id: string) =>
  api.put(`/Departments/${id}/restore`)

// Get my department (User role)
export const getMyDepartment = () =>
  api.get<DepartmentDto[]>('/Departments/my')

// Get department summary (for dashboard stats)
export const getDepartmentSummary = () =>
  api.get('/Departments/summary')

// Department service object
export const departmentService = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
  getMyDepartment,
  getDepartmentSummary,
}

