// src/services/departmentService.ts
import axios from './axios';
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
export const getAllDepartments = async (isDeleted) => {
    const res = await axios.get("/Departments", {
        params: isDeleted !== undefined ? { isDeleted } : {},
    });
    return res;
};
export const getMyDepartment = () => axios.get('/departments/my'); // ✅ API mới cho User
// Wrapper function để trả về data trực tiếp
// Trả về toàn bộ, cả đã xoá nếu cần
export const getAllDepartmentsData = async (includeDeleted = false) => {
    const response = await axios.get(`/Departments${includeDeleted ? '' : '?isDeleted=false'}`);
    return response.data;
};
export const getDepartmentById = (id) => axios.get(`/Departments/${id}`);
export const createDepartment = (data) => axios.post('/Departments', data);
export const updateDepartment = (id, data) => axios.put(`/Departments/${id}`, data);
export const deleteDepartment = (id) => axios.delete(`/Departments/${id}`);
export const restoreDepartment = (id) => axios.put(`/Departments/${id}/restore`);
export const fetchDepartments = async (isDeleted) => {
    const response = await axios.get("/Departments", {
        params: isDeleted !== undefined ? { isDeleted } : {},
    });
    return response.data;
};
export const getDepartmentSummary = () => {
    return axios.get('/api/departments/summary');
};
