export interface DeviceDto {
  id: string;
  deviceCode?: string; // vẫn giữ để hiển thị
  deviceName: string;
  status?: string;
  barcode?: string;
  serialNumber?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  warrantyProvider?: string;
  deviceImageUrl?: string;

  modelId?: string;
  supplierId?: string;
  currentUserId?: string;
  currentDepartmentId?: string;

  modelName?: string;
  deviceTypeName?: string;
  supplierName?: string;
  currentUserName?: string;
  departmentName?: string;

  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateDeviceDto {
  deviceName: string;
  modelId?: string;
  supplierId?: string;
  currentDepartmentId?: string;
  currentUserId?: string;
  purchasePrice?: number;
  serialNumber?: string;
  status?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  barcode?: string;
  deviceImageUrl?: string;
  warrantyProvider?: string;
}
 
export interface UpdateDeviceDto {
  deviceName?: string;
  modelId?: string;
  supplierId?: string;
  currentDepartmentId?: string;
  currentUserId?: string;
  purchasePrice?: number;
  serialNumber?: string;
  status?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  barcode?: string;
  deviceImageUrl?: string;
  warrantyProvider?: string;
  updatedBy?: string;
}
export interface PaginatedResult<T> {
  totalCount: number;
  items: T[];
}
