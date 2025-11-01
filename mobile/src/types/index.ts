export interface Device {
  id: string;
  deviceCode: string;
  deviceName: string;
  status: string;
  barcode?: string;
  serialNumber?: string;
  modelName?: string;
  deviceTypeName?: string;
  manufacturer?: string;
  currentUserName?: string;
  departmentName?: string;
  lastRepairDate?: string;
  repairCount: number;
  incidentCount: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  deviceImageUrl?: string;
}

export interface DeviceQrScanResult {
  id: string;
  deviceCode: string;
  deviceName: string;
  status: string;
  barcode?: string;
  serialNumber?: string;
  modelName?: string;
  deviceTypeName?: string;
  manufacturer?: string;
  currentUserName?: string;
  departmentName?: string;
  lastRepairDate?: string;
  repairCount: number;
  incidentCount: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  deviceImageUrl?: string;
}

export interface DeviceListItem {
  id: string;
  deviceCode: string;
  deviceName: string;
  status: string;
  modelName?: string;
  deviceTypeName?: string;
  currentUserName?: string;
  departmentName?: string;
}

export interface Repair {
  id: string;
  deviceId: string;
  deviceName?: string;
  deviceCode?: string;
  status: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  assignedDate?: string;
  repairDate?: string;
  cost?: number;
  laborHours?: number;
  repairCompany?: string;
  assignedToTechnicianId?: string;
}

export type RootStackParamList = {
  Login: undefined;
  AdminTabs: undefined;
  EmployeeTabs: undefined;
  TechnicianTabs: undefined;
  DeviceDetail: { device: DeviceQrScanResult };
  RepairDetail: { repair: Repair };
};

export type AdminTabParamList = {
  Dashboard: undefined;
  QRScanner: undefined;
};

export type EmployeeTabParamList = {
  MyDevices: undefined;
  QRScanner: undefined;
};

export type TechnicianTabParamList = {
  RepairList: undefined;
  QRScanner: undefined;
};

