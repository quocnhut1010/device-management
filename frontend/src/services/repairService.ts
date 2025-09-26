import axios from './axios';

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
  assignedToTechnicianId?: string;
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
  assignedToTechnician?: {
    id: string;
    fullName: string;
    email: string;
  };
  repairImages?: RepairImage[];
}

export interface RepairImage {
  id: string;
  repairId: string;
  imageUrl: string;
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

// Status constants
export const RepairStatus = {
  ChoThucHien: 0,       // Chờ thực hiện
  DangSua: 1,           // Đang sửa
  ChoDuyetHoanTat: 2,   // Chờ duyệt hoàn tất
  DaHoanTat: 3,         // Đã hoàn tất
  TuChoi: 4,            // Từ chối
  KhongCanSua: 5        // Không cần sửa
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

class RepairService {
  private readonly baseUrl = '/repair';

  // Admin xem tất cả lệnh sửa chữa
  async getAllRepairs(): Promise<Repair[]> {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }

  // Kỹ thuật viên xem lệnh sửa của mình
  async getMyRepairs(): Promise<Repair[]> {
    const response = await axios.get(`${this.baseUrl}/mine`);
    return response.data;
  }

  // Xem chi tiết một lệnh sửa chữa
  async getRepairById(id: string): Promise<Repair> {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Kỹ thuật viên chấp nhận lệnh sửa
  async acceptRepair(repairId: string): Promise<void> {
    await axios.post(`${this.baseUrl}/${repairId}/accept`);
  }

  // Kỹ thuật viên hoàn thành sửa chữa
  async completeRepair(repairId: string, data: RepairRequestDto): Promise<void> {
    await axios.post(`${this.baseUrl}/${repairId}/complete`, data);
  }

  // Admin xác nhận hoàn tất
  async confirmCompletion(repairId: string): Promise<void> {
    await axios.post(`${this.baseUrl}/${repairId}/confirm-completion`);
  }

  // Kỹ thuật viên từ chối lệnh sửa
  async rejectRepair(repairId: string, data: RejectRepairDto): Promise<void> {
    await axios.post(`${this.baseUrl}/${repairId}/reject`, data);
  }

  // Kỹ thuật viên đánh dấu "không cần sửa"
  async markAsNotNeeded(repairId: string, data: NotNeededRepairDto): Promise<void> {
    await axios.post(`${this.baseUrl}/${repairId}/not-needed`, data);
  }
}

export const repairService = new RepairService();