export interface Device {
  id: string;
  deviceCode: string;
  deviceName: string;
  status: string;
  currentUserId?: string;
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
  currentUserId?: string;
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
  currentUserId?: string;
  modelName?: string;
  deviceTypeName?: string;
  currentUserName?: string;
  departmentName?: string;
}

export interface RepairImage {
  id: string;
  repairId: string;
  imageUrl: string;
  description?: string;
  isAfterRepair?: boolean;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface Repair {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  technicianId?: string;
  technicianName?: string;
  incidentReportId?: string;
  status: number;
  startDate?: string;
  endDate?: string;
  repairDate?: string;
  description?: string;
  cost?: number;
  laborHours?: number;
  repairCompany?: string;
  assignedDate?: string;
  repairImages?: RepairImage[];
  rejectedReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export const RepairStatus = {
  ChoThucHien: 0,
  DangSua: 1,
  ChoDuyetHoanTat: 2,
  DaHoanTat: 3,
  TuChoi: 4,
  KhongCanSua: 5,
} as const;

export type RepairStatusValue = (typeof RepairStatus)[keyof typeof RepairStatus];

export const getRepairStatusText = (status: number): string => {
  switch (status) {
    case RepairStatus.ChoThucHien:
      return 'Chờ tiếp nhận';
    case RepairStatus.DangSua:
      return 'Đang sửa';
    case RepairStatus.ChoDuyetHoanTat:
      return 'Chờ duyệt hoàn tất';
    case RepairStatus.DaHoanTat:
      return 'Đã hoàn tất';
    case RepairStatus.TuChoi:
      return 'Từ chối';
    case RepairStatus.KhongCanSua:
      return 'Không cần sửa';
    default:
      return 'Không xác định';
  }
};

export const getRepairStatusColor = (status: number): string => {
  switch (status) {
    case RepairStatus.ChoThucHien:
      return '#ff9800';
    case RepairStatus.DangSua:
      return '#2196f3';
    case RepairStatus.ChoDuyetHoanTat:
      return '#9c27b0';
    case RepairStatus.DaHoanTat:
      return '#4caf50';
    case RepairStatus.TuChoi:
      return '#f44336';
    case RepairStatus.KhongCanSua:
      return '#757575';
    default:
      return '#757575';
  }
};

export type RootStackParamList = {
  Login: undefined;
  AdminTabs: undefined;
  EmployeeTabs: undefined;
  TechnicianTabs: undefined;
  DeviceDetail: { device: DeviceQrScanResult };
  IncidentReport: { device: DeviceQrScanResult };
  RepairDetail: { repair: Repair };
};

export type AdminTabParamList = {
  Dashboard: undefined;
  QRScanner: undefined;
};

export type EmployeeTabParamList = {
  Dashboard: undefined;
  MyDevices: undefined;
  QRScanner: undefined;
};

export type TechnicianTabParamList = {
  Dashboard: undefined;
  RepairList: undefined;
  QRScanner: undefined;
};

export interface IncidentReport {
  id: string;
  deviceId: string;
  reportType: string;
  description: string;
  imageUrl?: string;
  reportDate: string;
  status: number;
}

export interface CreateIncidentReportDto {
  deviceId: string;
  reportType: string;
  description: string;
  imageUrl?: string;
}

