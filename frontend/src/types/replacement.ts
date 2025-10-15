export interface ReplacementDto {
  id: string;
  oldDeviceId?: string;
  newDeviceId?: string;
  replacementDate?: string;
  reason?: string;
  
  // Thông tin thiết bị cũ
  oldDeviceCode?: string;
  oldDeviceName?: string;
  
  // Thông tin thiết bị mới
  newDeviceCode?: string;
  newDeviceName?: string;
  
  // Thông tin người dùng hiện tại được gán thiết bị cũ
  userId?: string;
  userFullName?: string;
  userEmail?: string;
}

export interface CreateReplacementDto {
  oldDeviceId: string;
  newDeviceId: string;
  reason: string;
  incidentReportId?: string; // Nếu thay thế từ incident report
}

export interface SuggestedDeviceDto {
  id: string;
  deviceCode: string;
  deviceName: string;
  modelName: string;
  typeName: string;
  status: string;
  purchaseDate?: string;
  purchasePrice?: number;
  deviceImageUrl?: string;
  isSameModel: boolean; // Có cùng model với thiết bị cũ không
}

// Types for UI components
export interface ReplacementFormData {
  oldDeviceId: string;
  newDeviceId: string;
  reason: string;
  incidentReportId?: string;
}

export interface ReplacementFilters {
  deviceId?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

// Status enum for replacement workflow
export enum ReplacementStatus {
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  PENDING = 'Pending'
}