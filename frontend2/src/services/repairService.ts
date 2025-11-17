import api from './api'

export interface RepairDeviceDto {
  id: string
  deviceCode: string
  deviceName: string
  deviceStatus?: string
  price?: number
}

export interface RepairIncidentDto {
  id: string
  reportType: string
  description: string
}

export interface RepairImage {
  id: string
  repairId: string
  imageUrl: string
  description?: string
  isAfterRepair?: boolean
  uploadedAt?: string
  uploadedBy?: string
}

export interface Repair {
  id: string
  deviceId: string
  deviceCode: string
  deviceName: string
  technicianId?: string
  technicianName?: string
  incidentReportId?: string
  status: number
  startDate?: string
  endDate?: string
  repairDate?: string
  description?: string
  cost?: number
  laborHours?: number
  repairCompany?: string
  rejectedBy?: string
  rejectedReason?: string
  rejectedAt?: string
  approvedBy?: string
  approvedAt?: string
  deviceStatus?: string
  warning?: string
  device?: RepairDeviceDto
  incidentReport?: RepairIncidentDto
  repairImages?: RepairImage[]
}

export interface TechnicianUser {
  id: string
  fullName: string
  email: string
  position: string
  departmentName?: string
}

export interface RepairRequestDto {
  description: string
  cost?: number
  laborHours?: number
  repairCompany?: string
  imageUrls?: string[]
}

export interface RejectRepairDto {
  reason: string
}

export interface NotNeededRepairDto {
  note: string
}

export interface RejectOrNotNeededDto {
  status: number
  reason: string
}

export interface AssignTechnicianDto {
  technicianId: string
  note?: string
}

export const RepairStatus = {
  ChoThucHien: 0,
  DangSua: 1,
  ChoDuyetHoanTat: 2,
  DaHoanTat: 3,
  TuChoi: 4,
  KhongCanSua: 5,
} as const

export type RepairStatusKey = keyof typeof RepairStatus

export const getRepairStatusText = (status: number): string => {
  switch (status) {
    case RepairStatus.ChoThucHien:
      return 'Chờ thực hiện'
    case RepairStatus.DangSua:
      return 'Đang sửa'
    case RepairStatus.ChoDuyetHoanTat:
      return 'Chờ duyệt hoàn tất'
    case RepairStatus.DaHoanTat:
      return 'Đã hoàn tất'
    case RepairStatus.TuChoi:
      return 'Từ chối'
    case RepairStatus.KhongCanSua:
      return 'Không cần sửa'
    default:
      return 'Không xác định'
  }
}

export const getRepairStatusBadge = (
  status: number
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case RepairStatus.ChoThucHien:
      return 'outline'
    case RepairStatus.DangSua:
      return 'default'
    case RepairStatus.ChoDuyetHoanTat:
      return 'secondary'
    case RepairStatus.DaHoanTat:
      return 'secondary'
    case RepairStatus.TuChoi:
      return 'destructive'
    case RepairStatus.KhongCanSua:
      return 'outline'
    default:
      return 'default'
  }
}

const base = '/Repair'

export const getAllRepairs = () => api.get<Repair[]>(base)

export const getMyRepairs = () => api.get<Repair[]>(`${base}/mine`)

export const getRepairById = (id: string) => api.get<Repair>(`${base}/${id}`)

export const acceptRepair = (id: string) => api.post(`${base}/${id}/accept`)

export const completeRepair = (id: string, data: RepairRequestDto) =>
  api.post(`${base}/${id}/complete`, data)

export const confirmCompletion = (id: string) => api.post(`${base}/${id}/confirm-completion`)

export const rejectRepair = (id: string, data: RejectRepairDto) =>
  api.post(`${base}/${id}/reject`, data)

export const markAsNotNeeded = (id: string, data: NotNeededRepairDto) =>
  api.post(`${base}/${id}/not-needed`, data)

export const rejectOrMarkNotNeeded = (id: string, data: RejectOrNotNeededDto) =>
  api.post(`${base}/${id}/reject-or-not-needed`, data)

export const assignTechnician = (id: string, data: AssignTechnicianDto) =>
  api.post(`${base}/${id}/assign`, data)

export const uploadRepairImages = (id: string, files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))

  return api.post<{ imageUrls: string[] }>(`${base}/${id}/upload-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getAvailableTechnicians = () => api.get<TechnicianUser[]>(`${base}/technicians`)

export const getDeviceRepairHistory = (deviceId: string) =>
  api.get<Repair[]>(`${base}/device/${deviceId}/history`)

export interface DeviceRepairAnalysis {
  deviceId: string
  deviceName: string
  deviceValue: number
  repairCount: number
  totalCost: number
  lastRepairDate?: string
  warnings: string[]
  suggestion?: string
}

export const analyzeDeviceRepairHistory = (deviceId: string) =>
  api.get<DeviceRepairAnalysis>(`${base}/device/${deviceId}/analysis`)

export const repairService = {
  getAllRepairs,
  getMyRepairs,
  getRepairById,
  acceptRepair,
  completeRepair,
  confirmCompletion,
  rejectRepair,
  markAsNotNeeded,
  rejectOrMarkNotNeeded,
  assignTechnician,
  uploadRepairImages,
  getAvailableTechnicians,
  getDeviceRepairHistory,
  analyzeDeviceRepairHistory,
  getRepairStatusText,
  getRepairStatusBadge,
}
