import apiClient from './api';
import {
  CreateIncidentReportDto,
  IncidentReport,
} from '../types';

const baseUrl = '/IncidentReport';

export interface UploadableImage {
  uri: string;
  name?: string;
  type?: string;
}

export const incidentService = {
  async createIncident(payload: CreateIncidentReportDto): Promise<IncidentReport> {
    const response = await apiClient.post<IncidentReport>(baseUrl, payload);
    return response.data;
  },

  async uploadIncidentImage(file: UploadableImage): Promise<string> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'incident.jpg',
      type: file.type || 'image/jpeg',
    } as any);

    const response = await apiClient.post<{ imageUrl: string }>(
      `${baseUrl}/upload-incident-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.imageUrl;
  },
};

export default incidentService;

