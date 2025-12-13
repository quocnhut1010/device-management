import api from './api'
import type { DeviceDto, CreateDeviceDto, UpdateDeviceDto, PaginatedResult } from '@/types'

// Get paged devices (Admin only)
export const getPagedDevices = async ({
  page,
  pageSize,
  search,
  status,
  modelId,
  departmentId,
}: {
  page: number
  pageSize: number
  search?: string
  status?: string
  modelId?: string
  departmentId?: string
}): Promise<PaginatedResult<DeviceDto>> => {
  const params: any = {
    page: page + 1, // Backend uses 1-based pagination
    pageSize,
  }
  if (search) params.search = search
  if (status) params.status = status
  if (modelId) params.modelId = modelId
  if (departmentId) params.departmentId = departmentId

  const response = await api.get('/Device/paged', { params })
  
  // Handle different response structures from backend
  const data = response.data
  
  // Backend might return { devices: [], total: number } or { items: [], totalCount: number }
  if (data.devices && Array.isArray(data.devices)) {
    return {
      items: data.devices,
      totalCount: data.total || data.totalCount || data.devices.length,
      devices: data.devices,
      total: data.total || data.totalCount || data.devices.length,
    }
  }
  
  if (data.items && Array.isArray(data.items)) {
    return {
      items: data.items,
      totalCount: data.totalCount || data.total || data.items.length,
      devices: data.items,
      total: data.totalCount || data.total || data.items.length,
    }
  }
  
  // Fallback: if response is directly an array
  if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      devices: data,
      total: data.length,
    }
  }
  
  // Default empty response
  return {
    items: [],
    totalCount: 0,
    devices: [],
    total: 0,
  }
}

// Get all devices (Admin only)
export const getAllDevices = async (includeDeleted: boolean = false): Promise<DeviceDto[]> => {
  const response = await api.get<DeviceDto[]>('/Device', {
    params: { includeDeleted },
  })
  return response.data
}

// Get deleted devices (Admin only)
export const getDeletedDevices = async (): Promise<DeviceDto[]> => {
  const response = await api.get<DeviceDto[]>('/Device/deleted')
  return response.data
}

// Get device by ID
export const getDeviceById = async (id: string): Promise<DeviceDto> => {
  const response = await api.get<DeviceDto>(`/Device/${id}`)
  return response.data
}

// Get my devices (User only)
export const getMyDevices = async (): Promise<DeviceDto[]> => {
  const response = await api.get<DeviceDto[]>('/Device/my')
  return response.data
}

// Get managed devices (Manager only)
export const getManagedDevices = async (): Promise<DeviceDto[]> => {
  const response = await api.get<DeviceDto[]>('/Device/managed')
  return response.data
}

// Create device with image (Admin only)
export const createDeviceWithImage = async (
  data: CreateDeviceDto & { file?: File | null }
): Promise<{ message: string; device?: DeviceDto }> => {
  const formData = new FormData()

  // Helper function to check if value is valid
  const isValidValue = (value: any): boolean => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) return false
    return true
  }

  // Process each field
  Object.entries(data).forEach(([key, value]) => {
    // Skip file field (handled separately)
    if (key === 'file') return

    // Only append valid values
    if (!isValidValue(value)) return

    // Handle different data types
    if (value instanceof Date) {
      formData.append(key, value.toISOString())
    } else if (typeof value === 'string') {
      // Only append non-empty strings
      if (value.trim() !== '') {
        formData.append(key, value.trim())
      }
    } else if (typeof value === 'number') {
      // Only append valid numbers
      if (!isNaN(value) && isFinite(value)) {
        formData.append(key, value.toString())
      }
    } else if (typeof value === 'boolean') {
      formData.append(key, value.toString())
    } else {
      // For other types, convert to string
      formData.append(key, String(value))
    }
  })

  // Add image file if provided
  if (data.file && data.file instanceof File) {
    formData.append('file', data.file)
  }

  const response = await api.post('/Device', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

// Update device with image (Admin only)
export const updateDeviceWithImage = async (
  id: string,
  data: UpdateDeviceDto & { file?: File | null }
): Promise<{ message: string }> => {
  const formData = new FormData()

  // Helper function to check if value is valid
  const isValidValue = (value: any): boolean => {
    if (value === undefined || value === null) return false
    if (typeof value === 'string' && value.trim() === '') return false
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) return false
    return true
  }

  // Process each field
  Object.entries(data).forEach(([key, value]) => {
    // Skip file field (handled separately)
    if (key === 'file') return

    // Only append valid values
    if (!isValidValue(value)) return

    // Handle different data types
    if (value instanceof Date) {
      formData.append(key, value.toISOString())
    } else if (typeof value === 'string') {
      // Only append non-empty strings
      if (value.trim() !== '') {
        formData.append(key, value.trim())
      }
    } else if (typeof value === 'number') {
      // Only append valid numbers (allow 0 for purchasePrice)
      if (!isNaN(value) && isFinite(value)) {
        formData.append(key, value.toString())
      }
    } else if (typeof value === 'boolean') {
      formData.append(key, value.toString())
    } else {
      // For other types, convert to string
      formData.append(key, String(value))
    }
  })

  // Add image file if provided
  if (data.file && data.file instanceof File) {
    formData.append('file', data.file)
  }

  const response = await api.put(`/Device/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

// Delete device (Admin only, soft delete)
export const deleteDevice = async (id: string): Promise<void> => {
  await api.delete(`/Device/${id}`)
}

// Restore device (Admin only)
export const restoreDevice = async (id: string): Promise<void> => {
  await api.put(`/Device/restore/${id}`)
}

// Get device QR token
export const getDeviceQrToken = async (id: string): Promise<string> => {
  const response = await api.get<{ token: string }>(`/Device/${id}/qr-token`)
  return response.data.token
}

// Device service object
export const deviceService = {
  getPagedDevices,
  getAllDevices,
  getDeletedDevices,
  getDeviceById,
  getMyDevices,
  getManagedDevices,
  createDeviceWithImage,
  updateDeviceWithImage,
  deleteDevice,
  restoreDevice,
  getDeviceQrToken,
}
