// Types cho tính năng thanh lý thiết bị

export interface LiquidationDto {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  reason: string;
  liquidationDate: string;
  approvedBy: string;
  approvedByName: string;
  createdAt?: string;
}

export interface CreateLiquidationDto {
  deviceId: string;
  reason: string;
  liquidationDate: string;
}

export interface BatchLiquidationDto {
  deviceIds: string[];
  reason: string;
  liquidationDate: string;
}

export interface EligibleDeviceDto {
  id: string;
  deviceCode: string;
  deviceName: string;
  status: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentUserName?: string;
  currentUserFullName?: string;
  currentDepartmentName?: string;
  eligibilityReason: string;
  hasActiveRepair: boolean;
  modelName?: string;
  typeName?: string;
}

export interface DeviceEligibilityDto {
  deviceId: string;
  isEligible: boolean;
  reason: string;
}