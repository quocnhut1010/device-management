// src/services/departmentService.ts
import axios from './axios';
import { DepartmentDto } from '../types/DepartmentDto';

// export interface DepartmentDto {
//   id: string;
//   departmentName: string;
//   departmentCode?: string;
//   location?: string;
//   isDeleted?: boolean;
//   updatedAt?: string;
//   updatedBy?: string;
//   deletedAt?: string;
//   deletedBy?: string;
//   deviceCount: number;
// }

// Nếu dùng axiosInstance.get<...>()
export const getAllDepartments = async (isDeleted?: boolean) => {
  const res = await axios.get<DepartmentDto[]>("/departments", {
    params: isDeleted !== undefined ? { isDeleted } : {},
  });
  return res;
};

export const getMyDepartment = () =>
  axios.get<DepartmentDto[]>('/departments/my'); // ✅ API mới cho User

// Wrapper function để trả về data trực tiếp
// Trả về toàn bộ, cả đã xoá nếu cần
export const getAllDepartmentsData = async (includeDeleted: boolean = false) => {
  const response = await axios.get<DepartmentDto[]>(
    `/departments${includeDeleted ? '' : '?isDeleted=false'}`
  );
  return response.data;
};


export const getDepartmentById = (id: string) => axios.get<DepartmentDto>(`/departments/${id}`);
export const createDepartment = (data: Partial<DepartmentDto>) => axios.post<DepartmentDto>('/departments', data);
export const updateDepartment = (id: string, data: Partial<DepartmentDto>) => axios.put<DepartmentDto>(`/departments/${id}`, data);
export const deleteDepartment = (id: string) => axios.delete(`/departments/${id}`);
export const restoreDepartment = (id: string) =>axios.put(`/departments/${id}/restore`);
export const fetchDepartments = async (isDeleted?: boolean) => {
  const response = await axios.get<DepartmentDto[]>("/departments", {
    params: isDeleted !== undefined ? { isDeleted } : {},
  });
  return response.data;
};
export const getDepartmentSummary = () => {
  return axios.get('/api/departments/summary');
};

