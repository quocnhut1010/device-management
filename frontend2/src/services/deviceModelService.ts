import api from './api'
import type { DeviceModelDto } from '@/types'

// Get all device models
export const getAllDeviceModels = (includeDeleted?: boolean) => {
  const params = includeDeleted !== undefined ? { includeDeleted } : {}
  return api.get<DeviceModelDto[]>('/DeviceModels', { params })
}

// Get device model by ID
export const getDeviceModelById = (id: string) => 
  api.get<DeviceModelDto>(`/DeviceModels/${id}`)

// Create device model
export const createDeviceModel = (data: Partial<DeviceModelDto>) => 
  api.post<DeviceModelDto>('/DeviceModels', data)

// Update device model
export const updateDeviceModel = (id: string, data: Partial<DeviceModelDto>) => 
  api.put<DeviceModelDto>(`/DeviceModels/${id}`, data)

// Delete device model (soft delete)
export const deleteDeviceModel = (id: string) => 
  api.delete(`/DeviceModels/${id}`)

// Restore deleted device model
export const restoreDeviceModel = (id: string) => 
  api.put(`/DeviceModels/restore/${id}`)

// Get active device models only
export const getActiveDeviceModels = () => 
  api.get<DeviceModelDto[]>('/DeviceModels', { params: { includeDeleted: false } })

// Device model service object
export const deviceModelService = {
  getAllDeviceModels,
  getDeviceModelById,
  createDeviceModel,
  updateDeviceModel,
  deleteDeviceModel,
  restoreDeviceModel,
  getActiveDeviceModels,
}
