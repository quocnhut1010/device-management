import api from './api'
import type {
  DeviceHistoryData,
  DeviceHistoryFilter,
  DeviceHistoryTimelineData,
  DeviceHistoryStats,
  CreateDeviceHistoryData,
  BulkDeviceHistoryData,
} from '@/types/deviceHistory'

// Get device history by device ID
export const getDeviceHistory = async (
  deviceId: string,
  filters?: DeviceHistoryFilter
): Promise<DeviceHistoryData[]> => {
  const params = new URLSearchParams()

  if (filters?.action) params.append('action', filters.action)
  if (filters?.actionType) params.append('actionType', filters.actionType)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get<DeviceHistoryData[]>(
    `/DeviceHistory/device/${deviceId}?${params.toString()}`
  )
  return response.data
}

// Get user history by user ID
export const getUserHistory = async (
  userId: string,
  filters?: DeviceHistoryFilter
): Promise<DeviceHistoryData[]> => {
  const params = new URLSearchParams()

  if (filters?.action) params.append('action', filters.action)
  if (filters?.actionType) params.append('actionType', filters.actionType)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get<DeviceHistoryData[]>(
    `/DeviceHistory/user/${userId}?${params.toString()}`
  )
  return response.data
}

// Get current user's history
export const getMyHistory = async (
  filters?: DeviceHistoryFilter
): Promise<DeviceHistoryData[]> => {
  const params = new URLSearchParams()

  if (filters?.action) params.append('action', filters.action)
  if (filters?.actionType) params.append('actionType', filters.actionType)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get<DeviceHistoryData[]>(
    `/DeviceHistory/my-history?${params.toString()}`
  )
  return response.data
}

// Get all history (Admin/Manager only)
export const getAllHistory = async (
  filters: DeviceHistoryFilter
): Promise<DeviceHistoryData[]> => {
  const params = new URLSearchParams()

  if (filters.deviceId) params.append('deviceId', filters.deviceId)
  if (filters.userId) params.append('userId', filters.userId)
  if (filters.action) params.append('action', filters.action)
  if (filters.actionType) params.append('actionType', filters.actionType)
  if (filters.fromDate) params.append('fromDate', filters.fromDate)
  if (filters.toDate) params.append('toDate', filters.toDate)
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get<DeviceHistoryData[]>(
    `/DeviceHistory?${params.toString()}`
  )
  return response.data
}

// Get history timeline
export const getHistoryTimeline = async (
  filters?: DeviceHistoryFilter
): Promise<DeviceHistoryTimelineData[]> => {
  const params = new URLSearchParams()

  if (filters?.deviceId) params.append('deviceId', filters.deviceId)
  if (filters?.userId) params.append('userId', filters.userId)
  if (filters?.action) params.append('action', filters.action)
  if (filters?.actionType) params.append('actionType', filters.actionType)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)

  const response = await api.get<DeviceHistoryTimelineData[]>(
    `/DeviceHistory/timeline?${params.toString()}`
  )
  return response.data
}

// Get history statistics
export const getHistoryStats = async (
  deviceId?: string,
  userId?: string,
  fromDate?: string
): Promise<DeviceHistoryStats> => {
  const params = new URLSearchParams()

  if (deviceId) params.append('deviceId', deviceId)
  if (userId) params.append('userId', userId)
  if (fromDate) params.append('fromDate', fromDate)

  const response = await api.get<DeviceHistoryStats>(
    `/DeviceHistory/stats?${params.toString()}`
  )
  return response.data
}

// Get specific history record by ID
export const getHistoryById = async (
  id: string
): Promise<DeviceHistoryData> => {
  const response = await api.get<DeviceHistoryData>(`/DeviceHistory/${id}`)
  return response.data
}

// Log a new action
export const logAction = async (data: CreateDeviceHistoryData): Promise<void> => {
  await api.post('/DeviceHistory', data)
}

// Log multiple actions in bulk
export const logBulkActions = async (
  data: BulkDeviceHistoryData
): Promise<void> => {
  await api.post('/DeviceHistory/bulk', data)
}

// Get available actions for filtering
export const getAvailableActions = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/DeviceHistory/available-actions')
  return response.data
}

// Get available action types for filtering
export const getAvailableActionTypes = async (): Promise<string[]> => {
  const response = await api.get<string[]>(
    '/DeviceHistory/available-action-types'
  )
  return response.data
}

// Delete a history record (Admin only)
export const deleteHistory = async (id: string): Promise<void> => {
  await api.delete(`/DeviceHistory/${id}`)
}

// Clean up old history records (Admin only)
export const cleanupOldHistory = async (
  beforeDate: string
): Promise<string> => {
  const response = await api.delete(
    `/DeviceHistory/cleanup?beforeDate=${beforeDate}`
  )
  return response.data
}
