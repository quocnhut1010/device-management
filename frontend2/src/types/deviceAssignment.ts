// Device Assignment DTOs and filters used across assignment features

export interface DeviceAssignmentDto {
  id: string
  deviceId: string
  deviceName: string
  deviceCode?: string
  // Trạng thái phân công: Pending / Accepted / Rejected
  status?: string
  modelName?: string
  deviceTypeName?: string
  assignedToUserName?: string
  assignedToDepartmentName?: string
  assignedToUserId?: string
  assignedToDepartmentId?: string
  assignedDate?: string
  returnedDate?: string
  note?: string
  // Người cấp phát
  assignedByUserId?: string
  assignedByUserName?: string
  // Thông tin xác nhận của người nhận
  userConfirmedAt?: string | null
  userConfirmedBy?: string | null
  rejectionReason?: string | null
}

export interface DeviceAssignmentFilters {
  status?: string
  modelName?: string
  deviceCode?: string
}

// Use PascalCase to match backend binder expectations
export interface CreateDeviceAssignmentDto {
  DeviceId: string
  AssignedToUserId: string
  AssignedToDepartmentId: string
  Note?: string
}

export interface TransferDeviceAssignmentDto {
  OldAssignmentId: string
  NewDepartmentId: string
  NewUserId: string
  Note?: string
}

