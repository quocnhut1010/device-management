import axios from './axios';
import { DeviceDto, CreateDeviceDto, UpdateDeviceDto, PaginatedResult } from '../types/device';

// Lấy danh sách thiết bị có phân trang
// deviceService.ts
export const getPagedDevices = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<PaginatedResult<DeviceDto>> => {
  const response = await axios.get(`/device/paged?page=${page + 1}&pageSize=${pageSize}`);
  // Map backend response structure to frontend expected structure
  return {
    items: response.data.devices || [],
    totalCount: response.data.total || 0
  };
};


// Lấy toàn bộ thiết bị chưa bị xoá
export const getAllDevices = async (): Promise<DeviceDto[]> => {
  const res = await axios.get('/device');
  return res.data;
};

// Lấy danh sách thiết bị đã xoá mềm
export const getDeletedDevices = async (): Promise<DeviceDto[]> => {
  const res = await axios.get('/device/deleted');
  return res.data;
};

// Khôi phục thiết bị đã xoá
export const restoreDevice = async (id: string): Promise<void> => {
  await axios.put(`/device/restore/${id}`);
};

// Lấy chi tiết thiết bị theo ID
export const getDeviceById = async (id: string): Promise<DeviceDto> => {
  const res = await axios.get(`/device/${id}`);
  return res.data;
};

// Tạo thiết bị mới
export const createDevice = async (device: CreateDeviceDto): Promise<void> => {
  await axios.post('/device', device);
};

// Cập nhật thiết bị
export const updateDevice = async (id: string, device: UpdateDeviceDto): Promise<void> => {
  await axios.put(`/device/${id}`, device);
};

// Xoá mềm thiết bị
export const deleteDevice = async (id: string): Promise<void> => {
  await axios.delete(`/device/${id}`);
};
export const createDeviceWithImage = async (formData: FormData) => {
  const res = await axios.post('/device', formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateDeviceWithImage = async (id: string, formData: FormData) => {
  const res = await axios.put(`/device/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Lấy danh sách thiết bị của tôi (cho Nhân viên)
export const getMyDevices = async (): Promise<DeviceDto[]> => {
  const res = await axios.get('/device/my');
  return res.data;
};

// Lấy danh sách thiết bị của phòng ban quản lý (cho Trưởng phòng)
export const getManagedDevices = async (): Promise<DeviceDto[]> => {
  const res = await axios.get('/device/managed');
  return res.data;
};
