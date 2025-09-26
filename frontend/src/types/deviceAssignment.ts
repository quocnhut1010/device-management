export interface DeviceAssignmentDto {
  modelName: string;
  id: string;
  deviceId: string;
  assignedToUserId: string | null;
  assignedToDepartmentId: string | null;
  assignedDate: string | null;
  returnedDate: string | null;
  note?: string;
  assignedToUserName?: string;
  assignedToDepartmentName?: string;
  deviceName?: string;
  status?: string;
  isDeleted?: boolean;
}

export interface CreateDeviceAssignmentDto {
  DeviceId: string; // Match backend Guid property
  AssignedToUserId: string; // Match backend Guid property
  AssignedToDepartmentId: string; // Match backend Guid property
  Note?: string; // Match backend property
}

export interface TransferDeviceAssignmentDto {
  oldAssignmentId: string;
  newUserId: string;
  newDepartmentId: string;
  note?: string;
}

// Filter interface for device assignment searches
export interface DeviceAssignmentFilters {
  deviceCode?: string;
  modelName?: string;
  status?: string;
}
