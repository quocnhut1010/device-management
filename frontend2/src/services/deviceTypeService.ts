import api from './api'
import type { DeviceTypeDto } from '@/types'

// Get all device types
export const getAllDeviceTypes = () => 
  api.get<DeviceTypeDto[]>('/DeviceTypes')

// Get device type by ID
export const getDeviceTypeById = (id: string) => 
  api.get<DeviceTypeDto>(`/DeviceTypes/${id}`)

// Create device type
export const createDeviceType = (data: DeviceTypeDto) => 
  api.post<DeviceTypeDto>('/DeviceTypes', data)

// Update device type
export const updateDeviceType = (id: string, data: DeviceTypeDto) => 
  api.put<DeviceTypeDto>(`/DeviceTypes/${id}`, data)

// Delete device type
export const deleteDeviceType = (id: string) => 
  api.delete(`/DeviceTypes/${id}`)

// Device type service object
export const deviceTypeService = {
  getAllDeviceTypes,
  getDeviceTypeById,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
}
