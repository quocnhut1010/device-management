import api from './api'

export interface IncidentDeviceDto {
  id: string
  deviceCode: string
  deviceName: string
  status: string
}

export interface IncidentUserDto {
  id: string
  fullName: string
  email: string
}

export interface IncidentReport {
  id: string
  deviceId: string
  reportedByUserId: string
  reportType: string
  description: string
  imageUrl?: string
  reportDate: string
  status: number
  rejectedReason?: string
  rejectedBy?: string
  rejectedAt?: string
  updatedAt?: string
  updatedBy?: string
  device?: IncidentDeviceDto
  reportedByUser?: IncidentUserDto
}

export interface CreateIncidentReportDto {
  deviceId: string
  reportType: string
  description: string
  imageUrl?: string
}

export interface RejectIncidentDto {
  reason: string
  decision: 'Keep' | 'Liquidate'
}

export const IncidentStatus = {
  ChoDuyet: 0,
  DaTaoLenhSua: 1,
  DaTuChoi: 2,
  DaDong: 3,
  ChoThucHien: 4,
} as const

export function getStatusText(status: number): string {
  switch (status) {
    case IncidentStatus.ChoDuyet: return 'Chờ duyệt'
    case IncidentStatus.DaTaoLenhSua: return 'Đã tạo lệnh sửa'
    case IncidentStatus.DaTuChoi: return 'Đã từ chối'
    case IncidentStatus.DaDong: return 'Đã đóng'
    case IncidentStatus.ChoThucHien: return 'Chờ thực hiện'
    default: return 'Không xác định'
  }
}

export function getStatusColor(status: number): 'default'|'secondary'|'destructive'|'success'|'warning'|'info' {
  switch (status) {
    case IncidentStatus.ChoDuyet: return 'warning'
    case IncidentStatus.DaTaoLenhSua: return 'info'
    case IncidentStatus.DaTuChoi: return 'destructive'
    case IncidentStatus.DaDong: return 'success'
    case IncidentStatus.ChoThucHien: return 'secondary'
    default: return 'default'
  }
}

// Priority mapping from reportType → label + color
export function mapPriority(reportType: string): { label: string; color: 'default'|'destructive'|'warning'|'success'|'info'|'secondary' } {
  const t = (reportType || '').toLowerCase()
  if (t.includes('mất mát') || t.includes('mat mat')) return { label: 'Critical', color: 'destructive' }       // 🔴
  if (t.includes('hỏng hóc phần cứng') || t.includes('hong hoc phan cung')) return { label: 'High', color: 'warning' } // 🟠
  if (t.includes('hư hỏng vật lý') || t.includes('hu hong vat ly')) return { label: 'Medium', color: 'warning' }       // 🟡
  if (t.includes('lỗi phần mềm') || t.includes('loi phan mem')) return { label: 'Low', color: 'success' }      // 🟢
  if (t.includes('lỗi kết nối') || t.includes('loi ket noi')) return { label: 'Minor', color: 'info' }         // 🔵
  if (t.includes('khác') || t.includes('khac')) return { label: 'Unknown', color: 'secondary' }                // ⚪
  return { label: 'Unknown', color: 'secondary' }
}

const base = '/IncidentReport'

export const createIncident = (data: CreateIncidentReportDto) =>
  api.post<IncidentReport>(base, data)

export const approveIncident = (id: string) =>
  api.post(`${base}/${id}/approve`, {})

export const rejectIncident = (id: string, data: RejectIncidentDto) =>
  api.post(`${base}/${id}/reject`, data)

export const getAllIncidents = () =>
  api.get<IncidentReport[]>(`${base}/all`)

export const getMyIncidents = () =>
  api.get<IncidentReport[]>(`${base}/mine`)

export const getIncidentById = (id: string) =>
  api.get<IncidentReport>(`${base}/${id}`)

export const uploadIncidentImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<{ imageUrl: string }>(`${base}/upload-incident-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const incidentService = {
  createIncident,
  approveIncident,
  rejectIncident,
  getAllIncidents,
  getMyIncidents,
  getIncidentById,
  uploadIncidentImage,
  getStatusText,
  getStatusColor,
  mapPriority,
}

