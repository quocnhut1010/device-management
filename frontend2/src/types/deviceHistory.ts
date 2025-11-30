export interface DeviceHistoryData {
  id: string
  deviceId: string
  deviceName: string
  action: string
  description: string
  actionBy: string
  actionByName: string
  actionDate: string
  actionType: string
}

export interface DeviceHistoryFilter {
  deviceId?: string
  userId?: string
  action?: string
  actionType?: string
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DeviceHistoryTimelineData {
  date: string
  events: DeviceHistoryData[]
  eventCount: number
}

export interface DeviceHistoryStats {
  totalEvents: number
  recentEvents: number
  eventsByType: Record<string, number>
  eventsByAction: Record<string, number>
  recentActivities: DeviceHistoryData[]
}

export interface CreateDeviceHistoryData {
  deviceId: string
  action: string
  description: string
  actionType: string
}

export interface BulkDeviceHistoryData {
  histories: CreateDeviceHistoryData[]
}

export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'ASSIGNMENT'
  | 'REVOCATION'
  | 'MAINTENANCE'
  | 'REPAIR'
  | 'REPLACEMENT'
  | 'LIQUIDATION'
  | 'SYSTEM'

export type ActionTypeColor = {
  [key in ActionType]: string
}

export const ACTION_TYPE_COLORS: ActionTypeColor = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  RESTORE: 'warning',
  ASSIGNMENT: 'primary',
  REVOCATION: 'secondary',
  MAINTENANCE: 'warning',
  REPAIR: 'error',
  REPLACEMENT: 'info',
  LIQUIDATION: 'error',
  SYSTEM: 'default',
}

export const ACTION_TYPE_LABELS: ActionTypeColor = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  RESTORE: 'Khôi phục',
  ASSIGNMENT: 'Cấp phát',
  REVOCATION: 'Thu hồi',
  MAINTENANCE: 'Bảo trì',
  REPAIR: 'Sửa chữa',
  REPLACEMENT: 'Thay thế',
  LIQUIDATION: 'Thanh lý',
  SYSTEM: 'Hệ thống',
}

// Mapping raw action strings from backend to Vietnamese labels for UI (Thống kê theo hành động)
export const ACTION_LABELS: Record<string, string> = {
  'Tạo thiết bị': 'Tạo thiết bị',
  'Cập nhật thiết bị': 'Cập nhật thiết bị',
  'Xoá thiết bị': 'Xóa thiết bị',
  'Khôi phục thiết bị': 'Khôi phục thiết bị',
  'Cấp phát thiết bị': 'Cấp phát thiết bị',
  'Thu hồi thiết bị': 'Thu hồi thiết bị',
  'Phân công kỹ thuật viên sửa chữa': 'Phân công kỹ thuật viên sửa chữa',
  'Hoàn tất sửa chữa': 'Hoàn tất sửa chữa',
  'Từ chối sửa chữa': 'Từ chối sửa chữa',
  'Không cần sửa chữa': 'Không cần sửa chữa',
  'Thay thế thiết bị': 'Thay thế thiết bị',
  'Cấp phát thiết bị thay thế': 'Cấp phát thiết bị thay thế',
  'Thay thế trước khi thanh lý': 'Thay thế trước khi thanh lý',
  'Đã xử lý sự cố bằng thay thế': 'Đã xử lý sự cố bằng thay thế',
  'Thanh lý thiết bị': 'Thanh lý thiết bị',
}

