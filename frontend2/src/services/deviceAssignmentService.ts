import api from './api'
import type { 
  DeviceAssignmentDto, 
  DeviceAssignmentFilters, 
  CreateDeviceAssignmentDto, 
  TransferDeviceAssignmentDto 
} from '@/types'

export const getAssignments = () => 
  api.get<DeviceAssignmentDto[]>('/DeviceAssignment')

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

export const deviceAssignmentService = {
  getAssignments,
  getInUseAssignments,
  getUnassignedDevices,
  createAssignment,
  revokeAssignment,
  transferAssignment,
}

