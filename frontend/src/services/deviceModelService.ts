import axios from './axios';
import { DeviceModelDto } from '../types/DeviceModelDto';

export const getAllDeviceModels = (isDeleted?: boolean) =>
  axios.get('/DeviceModels', {
    params: isDeleted !== undefined ? { isDeleted } : {},
  });

export const getDeviceModelById = (id: string) => axios.get<DeviceModelDto>(`/DeviceModels/${id}`);
export const createDeviceModel = (data: Partial<DeviceModelDto>) =>
  axios.post('/DeviceModels', data);

export const updateDeviceModel = (id: string, data: Partial<DeviceModelDto>) =>
  axios.put(`/DeviceModels/${id}`, data);

export const deleteDeviceModel = (id: string) => axios.delete(`/DeviceModels/${id}`);

export const restoreDeviceModel = (id: string) =>
  axios.put(`/DeviceModels/restore/${id}`); // ✅ Thêm mới

export const getActiveDeviceModels = () => {
  return axios.get('/DeviceModels?isDeleted=false'); // ✅ chỉ lấy model chưa xoá mềm
};
