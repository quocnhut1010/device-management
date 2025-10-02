import api from './axios';

// ========== INTERFACES ==========
export interface Repair {
  id: string;
  deviceId: string;
  deviceCode: string;
  deviceName: string;
  incidentReportId?: string;
  startDate?: string;
  endDate?: string;
  repairDate?: string;
  description?: string;
  cost?: number;
  laborHours?: number;
  repairCompany?: string;
  status: number;
  rejectedBy?: string;
  rejectedReason?: string;
  rejectedAt?: string;
  technicianId?: string;
  technicianName?: string;
  approvedBy?: string;
  approvedAt?: string;
  device?: {
    id: string;
    deviceCode: string;
    deviceName: string;
  };
  incidentReport?: {
    id: string;
    reportType: string;
    description: string;
  };
  repairImages?: RepairImage[];
}

export interface RepairImage {
  id: string;
  repairId: string;
  imageUrl: string;
  description?: string;
}

export interface RepairRequestDto {
  description?: string;
  cost?: number;
  laborHours?: number;
  repairCompany?: string;
  imageUrls?: string[];
}

export interface RejectRepairDto {
  reason: string;
}

export interface NotNeededRepairDto {
  note: string;
}

export interface RejectOrNotNeededDto {
  status: number;
  reason: string;
}

export interface AssignTechnicianDto {
  technicianId: string;
  note?: string;
}

export interface TechnicianUser {
  id: string;
  fullName: string;
  email: string;
  position: string;
  departmentName?: string;
}

// ========== STATUS ==========
export const RepairStatus = {
  ChoThucHien: 0,
  DangSua: 1,
  ChoDuyetHoanTat: 2,
  DaHoanTat: 3,
  TuChoi: 4,
  KhongCanSua: 5,
} as const;
export const getRepairStatusText = (status: number): string => {
  switch (status) {
    case RepairStatus.ChoThucHien: return 'Chờ thực hiện';
    case RepairStatus.DangSua: return 'Đang sửa';
    case RepairStatus.ChoDuyetHoanTat: return 'Chờ duyệt hoàn tất';
    case RepairStatus.DaHoanTat: return 'Đã hoàn tất';
    case RepairStatus.TuChoi: return 'Từ chối';
    case RepairStatus.KhongCanSua: return 'Không cần sửa';
    default: return 'Không xác định';
  }
};

export const getRepairStatusColor = (status: number): string => {
  switch (status) {
    case RepairStatus.ChoThucHien: return 'warning';
    case RepairStatus.DangSua: return 'info';
    case RepairStatus.ChoDuyetHoanTat: return 'primary';
    case RepairStatus.DaHoanTat: return 'success';
    case RepairStatus.TuChoi: return 'error';
    case RepairStatus.KhongCanSua: return 'default';
    default: return 'default';
  }
};

// ========== API METHODS ==========

// Lấy toàn bộ sửa chữa
const getAllRepairs = async (): Promise<Repair[]> => {
  const res = await api.get('/repair');
  return res.data;
};

// Lấy danh sách sửa chữa của chính kỹ thuật viên
const getMyRepairs = async (): Promise<Repair[]> => {
  const res = await api.get('/repair/mine');
  return res.data;
};

// Hoàn tất sửa chữa (kỹ thuật viên)
const completeRepair = async (repairId: string, data: RepairRequestDto) => {
  return await api.post(`/repair/${repairId}/complete`, data);
};

// Upload hình ảnh sau sửa chữa (kỹ thuật viên)
const uploadRepairImages = async (repairId: string, files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const res = await api.post(`/repair/${repairId}/upload-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.imageUrls;
};

// Từ chối sửa chữa
const rejectRepair = async (repairId: string, data: RejectRepairDto) => {
  return await api.post(`/repair/${repairId}/reject`, data);
};

// Đánh dấu không cần sửa
const markAsNotNeeded = async (repairId: string, data: NotNeededRepairDto) => {
  return await api.post(`/repair/${repairId}/not-needed`, data);
};

// Từ chối hoặc không cần sửa (gộp)
const rejectOrMarkNotNeeded = async (repairId: string, data: RejectOrNotNeededDto) => {
  return await api.post(`/repair/${repairId}/reject-or-not-needed`, data);
};

// Gán kỹ thuật viên
const assignTechnician = async (repairId: string, data: AssignTechnicianDto) => {
  return await api.post(`/repair/${repairId}/assign`, data);
};

// Kỹ thuật viên chấp nhận tiếp nhận sửa chữa
const acceptRepair = async (repairId: string) => {
  return await api.post(`/repair/${repairId}/accept`);
};

// Admin xác nhận hoàn tất sửa chữa
const confirmCompletion = async (repairId: string) => {
  return await api.post(`/repair/${repairId}/confirm-completion`);
};

// Lấy danh sách kỹ thuật viên khả dụng
const getAvailableTechnicians = async (): Promise<TechnicianUser[]> => {
  const res = await api.get('/repair/technicians');
  return res.data;
};

// ========== EXPORT ==========
export const repairService = {
  getAllRepairs,
  getMyRepairs,
  completeRepair,
  uploadRepairImages,
  rejectRepair,
  markAsNotNeeded,
  rejectOrMarkNotNeeded,
  assignTechnician,
  acceptRepair,
  confirmCompletion,
  getAvailableTechnicians,
};
