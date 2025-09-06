// src/services/deviceTypeService.ts
import axios from './axios';
export const getAllDeviceTypes = () => axios.get('/devicetypes');
export const getDeviceTypeById = (id) => axios.get(`/devicetypes/${id}`);
export const createDeviceType = (data) => axios.post('/devicetypes', data);
export const updateDeviceType = (id, data) => axios.put(`/devicetypes/${id}`, data);
export const deleteDeviceType = (id) => axios.delete(`/devicetypes/${id}`);
