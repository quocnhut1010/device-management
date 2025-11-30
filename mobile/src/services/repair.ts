import apiClient from './api';
import { Repair } from '../types';

export interface RepairImage {
  id: string;
  repairId: string;
  imageUrl: string;
  description?: string;
  isAfterRepair?: boolean;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface RepairRequestDto {
  description: string;
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

const baseUrl = '/Repair';

export const repairService = {
  async getMyRepairs(): Promise<Repair[]> {
    const response = await apiClient.get(`${baseUrl}/mine`);
    return response.data;
  },

  async getRepairById(id: string): Promise<Repair> {
    const response = await apiClient.get(`${baseUrl}/${id}`);
    return response.data;
  },

  async acceptRepair(id: string): Promise<void> {
    await apiClient.post(`${baseUrl}/${id}/accept`);
  },

  async completeRepair(id: string, payload: RepairRequestDto): Promise<void> {
    await apiClient.post(`${baseUrl}/${id}/complete`, payload);
  },

  async rejectOrMarkNotNeeded(id: string, payload: RejectOrNotNeededDto): Promise<void> {
    await apiClient.post(`${baseUrl}/${id}/reject-or-not-needed`, payload);
  },

  async confirmCompletion(id: string): Promise<void> {
    await apiClient.post(`${baseUrl}/${id}/confirm-completion`);
  },

  async uploadRepairImages(id: string, files: Array<{ uri: string; name?: string; type?: string }>): Promise<string[]> {
    const formData = new FormData();

    files.forEach((file, index) => {
      const fileName = file.name || `repair-${id}-${index}.jpg`;
      formData.append('files', {
        uri: file.uri,
        name: fileName,
        type: file.type || 'image/jpeg',
      } as any);
    });

    const response = await apiClient.post(`${baseUrl}/${id}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data?.imageUrls ?? [];
  },
};

export default repairService;

