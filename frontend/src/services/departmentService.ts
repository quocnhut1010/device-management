// src/services/departmentService.ts
import axios from './axios';

export interface DepartmentDto {
  id: string;
  departmentName: string;
  departmentCode?: string;
  location?: string;
  isDeleted?: boolean;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export const getAllDepartments = () => axios.get<DepartmentDto[]>('/Departments');
export const getDepartmentById = (id: string) => axios.get<DepartmentDto>(`/Departments/${id}`);
export const createDepartment = (data: Partial<DepartmentDto>) => axios.post<DepartmentDto>('/Departments', data);
export const updateDepartment = (id: string, data: Partial<DepartmentDto>) => axios.put<DepartmentDto>(`/Departments/${id}`, data);
export const deleteDepartment = (id: string) => axios.delete(`/Departments/${id}`);
export const restoreDepartment = (id: string) =>axios.put(`/Departments/${id}/restore`);
