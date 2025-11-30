export type UserRole = "admin" | "user" | "manager" | "technician" | "employee"

// JWT Token Payload
export interface TokenPayload {
  nameid: string      // User ID (ClaimTypes.NameIdentifier)
  email: string
  role: string        // Admin, User
  position?: string   // Nhân viên, Trưởng phòng, Kỹ thuật viên
  exp: number
  iss: string
  aud: string
}

// Login DTO
export interface LoginDto {
  email: string
  password: string
}

// User DTO (from backend)
export interface UserDto {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  role: string
  position?: string
  departmentId?: string
  departmentName?: string
  isDeleted: boolean
  createdAt?: string
  updatedAt?: string
}

// Register User DTO
export interface RegisterUserDto {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  role: string
  position?: string
  departmentId?: string
}

// Legacy User interface (for compatibility)
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId?: string
  departmentName?: string
  position?: string
}

export interface Device {
  id: string
  code: string
  name: string
  model: string
  status: "available" | "in-use" | "repairing" | "pending-liquidation"
  departmentId: string
  departmentName: string
  userId?: string
  userName?: string
  warrantyExpiry?: string
}

export interface IncidentReport {
  id: string
  deviceId: string
  deviceName: string
  departmentName: string
  createdBy: string
  createdAt: string
  status: "pending" | "approved" | "rejected" | "in-progress" | "resolved"
  description: string
  priority: "low" | "medium" | "high" | "critical"
}

export interface RepairOrder {
  id: string
  deviceId: string
  deviceName: string
  technicianId?: string
  technicianName?: string
  status: "pending" | "assigned" | "in-progress" | "completed" | "rejected"
  priority: "low" | "medium" | "high" | "critical"
  slaRemaining?: string
  createdAt: string
  completedAt?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  createdAt: string
}

// DeviceModel DTO (from backend)
export interface DeviceModelDto {
  id: string
  modelName: string
  deviceTypeId: string | null
  typeName?: string  // for display
  manufacturer?: string
  specifications?: string
  isDeleted: boolean
  updatedAt?: string
  deletedAt?: string
}

// DeviceType DTO (from backend)
export interface DeviceTypeDto {
  id: string
  typeName: string
  description?: string
  isDeleted?: boolean
  updatedAt?: string
  deviceCount?: number  // computed from device models
}

// Department DTO (from backend)
export interface DepartmentDto {
  id: string
  departmentName: string
  departmentCode?: string
  location?: string
  isDeleted: boolean
  updatedAt?: string
  updatedBy?: string
  deletedAt?: string
  deletedBy?: string
  deviceCount: number  // computed from backend
  userCount: number    // computed from backend
}

// Supplier DTO (from backend)
export interface SupplierDto {
  id: string
  supplierName: string
  contactPerson?: string
  email?: string
  phone?: string
  isDeleted?: boolean
  updatedAt?: string
  updatedBy?: string
  deletedAt?: string
  deletedBy?: string
  deviceCount: number  // computed from backend
}

// Device DTO (from backend)
export interface DeviceDto {
  id: string
  deviceCode?: string
  deviceName: string
  status?: string
  barcode?: string
  serialNumber?: string
  purchasePrice?: number
  purchaseDate?: string
  warrantyExpiry?: string
  warrantyProvider?: string
  deviceImageUrl?: string
  modelId?: string
  supplierId?: string
  currentUserId?: string
  currentDepartmentId?: string
  modelName?: string
  deviceTypeName?: string
  supplierName?: string
  currentUserName?: string
  departmentName?: string
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
  isDeleted?: boolean
}

// Create Device DTO
export interface CreateDeviceDto {
  deviceName: string
  modelId?: string
  supplierId?: string
  purchasePrice?: number
  serialNumber?: string
  status?: string
  purchaseDate?: string
  warrantyExpiry?: string
  warrantyProvider?: string
  barcode?: string
  deviceImageUrl?: string
  currentDepartmentId?: string
  currentUserId?: string
  createdBy?: string
}

// Update Device DTO
export interface UpdateDeviceDto {
  deviceName?: string
  modelId?: string
  supplierId?: string
  purchasePrice?: number
  serialNumber?: string
  status?: string
  purchaseDate?: string
  warrantyExpiry?: string
  warrantyProvider?: string
  barcode?: string
  deviceImageUrl?: string
  currentDepartmentId?: string
  currentUserId?: string
  updatedBy?: string
}

// Paginated Result
export interface PaginatedResult<T> {
  totalCount: number
  items: T[]
  devices?: T[]  // backend sometimes returns devices instead of items
  total?: number  // backend sometimes returns total instead of totalCount
}

// Legacy interfaces (for compatibility)
export interface DeviceModel {
  id: string
  name: string
  manufacturer: string
  deviceTypeId: string
  deviceTypeName: string
  specifications: string
  averagePrice: number
  warrantyPeriod: number // in months
  status: "active" | "discontinued"
}

export interface DeviceType {
  id: string
  name: string
  description: string
  icon: string
  totalDevices: number
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive"
  totalDevicesSupplied: number
}

export interface Department {
  id: string
  name: string
  code: string
  managerId: string
  managerName: string
  totalDevices: number
  totalEmployees: number
}

export interface DeviceAssignment {
  id: string
  deviceId: string
  deviceName: string
  userId: string
  userName: string
  departmentId: string
  departmentName: string
  assignedDate: string
  returnedDate?: string
  status: "active" | "returned"
  notes?: string
}

export interface Replacement {
  id: string
  oldDeviceId: string
  oldDeviceName: string
  newDeviceId: string
  newDeviceName: string
  reason: string
  performedBy: string
  performedDate: string
  cost?: number
}

// Replacement DTOs for API
export interface ReplacementDto {
  id: string
  oldDeviceId?: string
  newDeviceId?: string
  replacementDate?: string
  reason?: string
  oldDeviceCode?: string
  oldDeviceName?: string
  newDeviceCode?: string
  newDeviceName?: string
  userId?: string
  userFullName?: string
  userEmail?: string
  performedById?: string
  performedByFullName?: string
  performedByEmail?: string
}

export interface CreateReplacementDto {
  oldDeviceId: string
  newDeviceId: string
  reason: string
  incidentReportId?: string
}

export interface SuggestedDeviceDto {
  id: string
  deviceCode: string
  deviceName: string
  modelName: string
  typeName: string
  status: string
  purchaseDate?: string
  purchasePrice?: number
  deviceImageUrl?: string
  isSameModel: boolean
}

export interface ReplacementFilters {
  deviceId?: string
  startDate?: string
  endDate?: string
  userId?: string
}

export interface Liquidation {
  id: string
  deviceId: string
  deviceName: string
  deviceCode: string
  reason: string
  approvedBy: string
  approvedDate: string
  liquidationDate?: string
  status: "pending" | "approved" | "completed"
  value?: number
}

export interface DeviceHistory {
  id: string
  deviceId: string
  deviceName: string
  action: "created" | "assigned" | "returned" | "repaired" | "replaced" | "liquidated" | "updated"
  performedBy: string
  performedDate: string
  details: string
}

export interface ReportExport {
  id: string
  reportType: string
  generatedBy: string
  generatedDate: string
  format: "pdf" | "excel" | "csv"
  parameters: string
  fileSize: string
  status: "completed" | "failed" | "processing"
}

// Re-exports for device assignment types
export * from './deviceAssignment'

// Re-exports for device history types
export * from './deviceHistory'

// Re-exports for report export types
export * from './reportExport'
