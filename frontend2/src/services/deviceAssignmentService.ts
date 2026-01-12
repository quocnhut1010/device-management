import api from './api'
import type { 
  DeviceAssignmentDto, 
  DeviceAssignmentFilters, 
  CreateDeviceAssignmentDto, 
  TransferDeviceAssignmentDto 
} from '@/types'

export interface PagedDeviceAssignmentResponse {
  items: DeviceAssignmentDto[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const getAssignments = (page?: number, pageSize?: number, status?: string) => {
  const params: Record<string, string> = {}
  if (page !== undefined) params.page = page.toString()
  if (pageSize !== undefined) params.pageSize = pageSize.toString()
  if (status) params.status = status
  
  if (Object.keys(params).length > 0) {
    return api.get<PagedDeviceAssignmentResponse>('/DeviceAssignment', { params })
  }
  return api.get<DeviceAssignmentDto[]>('/DeviceAssignment')
}

export const getInUseAssignments = () =>
  api.get<DeviceAssignmentDto[]>('/DeviceAssignment/inuse')

export const getUnassignedDevices = (filters?: DeviceAssignmentFilters) => {
  const params: Record<string, string> = {}
  if (filters?.status) params.status = filters.status
  if (filters?.modelName) params.modelName = filters.modelName
  if (filters?.deviceCode) params.deviceCode = filters.deviceCode
  return api.get<DeviceAssignmentDto[]>('/DeviceAssignment/unassigned', { params })
}

export const createAssignment = (data: CreateDeviceAssignmentDto) => 
  api.post<DeviceAssignmentDto>('/DeviceAssignment', data)

export const revokeAssignment = (assignmentId: string) => 
  api.post(`/DeviceAssignment/${assignmentId}/revoke`, {})

export const transferAssignment = (data: TransferDeviceAssignmentDto) => 
  api.post<DeviceAssignmentDto>('/DeviceAssignment/transfer', data)

export const confirmAssignment = (id: string, action: 'accept' | 'reject', rejectionReason?: string) =>
  api.post<DeviceAssignmentDto>(`/DeviceAssignment/${id}/confirm`, {
    Action: action,
    RejectionReason: rejectionReason || undefined,
  })

export const deviceAssignmentService = {
  getAssignments,
  getInUseAssignments,
  getUnassignedDevices,
  createAssignment,
  revokeAssignment,
  transferAssignment,
  confirmAssignment,
}

