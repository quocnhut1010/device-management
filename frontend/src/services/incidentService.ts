import axios from './axios';

export interface IncidentReport {
  id: string;
  deviceId: string;
  reportedByUserId: string;
  reportType: string;
  description: string;
  reportDate: string;
  status: number;
  imageUrl?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  rejectedAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  device?: {
    id: string;
    deviceCode: string;
    deviceName: string;
    status: string;
    currentUserName?: string;
    departmentName?: string;
  };
  reportedByUser?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateIncidentReportDto {
  deviceId: string;
  reportType: string;
  description: string;
  imageUrl?: string;
}

export interface RejectIncidentDto {
  reason: string;
  decision: 'Keep' | 'Liquidate';
}

// Status constants
export const IncidentStatus = {
  ChoDuyet: 0,        // Chờ duyệt
  DaTaoLenhSua: 1,    // Đã tạo lệnh sửa
  DaTuChoi: 2,        // Đã từ chối
  DaDong: 3,          // Đã đóng
  ChoThucHien: 4      // Chờ thực hiện
} as const;

export const getStatusText = (status: number): string => {
  switch (status) {
    case IncidentStatus.ChoDuyet: return 'Chờ duyệt';
    case IncidentStatus.DaTaoLenhSua: return 'Đã tạo lệnh sửa';
    case IncidentStatus.DaTuChoi: return 'Đã từ chối';
    case IncidentStatus.DaDong: return 'Đã đóng';
    case IncidentStatus.ChoThucHien: return 'Chờ thực hiện';
    default: return 'Không xác định';
  }
};

export const getStatusColor = (status: number): string => {
  switch (status) {
    case IncidentStatus.ChoDuyet: return 'warning';
    case IncidentStatus.DaTaoLenhSua: return 'info';
    case IncidentStatus.DaTuChoi: return 'error';
    case IncidentStatus.DaDong: return 'success';
    case IncidentStatus.ChoThucHien: return 'primary';
    default: return 'default';
  }
};

class IncidentService {
  private readonly baseUrl = '/incidentreport';
  

  // Tạo báo cáo sự cố (Nhân viên)
  async createReport(data: CreateIncidentReportDto): Promise<IncidentReport> {
    const response = await axios.post(this.baseUrl, data);
    return response.data;
  }

  // Admin duyệt và tạo lệnh sửa chữa
  async approveReport(id: string): Promise<any> {
    const response = await axios.post(`${this.baseUrl}/${id}/approve`);
    return response.data;
  }

  // Admin từ chối báo cáo
  async rejectReport(id: string, data: RejectIncidentDto): Promise<void> {
    await axios.post(`${this.baseUrl}/${id}/reject`, data);
  }

  // Admin/Kỹ thuật viên xem tất cả báo cáo
  async getAllReports(): Promise<IncidentReport[]> {
    const response = await axios.get(`${this.baseUrl}/all`);
    return response.data;
  }

  // Nhân viên xem báo cáo của mình
  async getMyReports(): Promise<IncidentReport[]> {
    const response = await axios.get(`${this.baseUrl}/mine`);
    return response.data;
  }

  // Xem chi tiết một báo cáo
  async getReportById(id: string): Promise<IncidentReport> {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }
  // Thêm vào cuối class IncidentService trong incidentService.ts
  async uploadIncidentImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/incidentreport/upload-incident-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl; // Backend trả về đường dẫn /images/incidents/abc.jpg
  }

}


export const incidentService = new IncidentService();