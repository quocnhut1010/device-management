// src/services/deviceTypeService.ts
import axios from './axios';
import { DeviceTypeDto } from '../types/DeviceTypeDto';

export const getAllDeviceTypes = () => axios.get<DeviceTypeDto[]>('/devicetypes');
export const getDeviceTypeById = (id: string) => axios.get<DeviceTypeDto>(`/devicetypes/${id}`);
export const createDeviceType = (data: DeviceTypeDto) => axios.post('/devicetypes', data);
export const updateDeviceType = (id: string, data: DeviceTypeDto) => axios.put(`/devicetypes/${id}`, data);
export const deleteDeviceType = (id: string) => axios.delete(`/devicetypes/${id}`);
