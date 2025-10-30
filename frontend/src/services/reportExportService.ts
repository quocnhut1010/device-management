import axios from './axios';
import { ExportRequestDto, ReportExportDto } from '../types/reportExport';

export const exportReport = async (request: ExportRequestDto): Promise<Blob> => {
  const response = await axios.post('/reports/export', request, {
    responseType: 'blob',
  });
  return response.data;
};

export const getExportHistory = async (): Promise<ReportExportDto[]> => {
  const response = await axios.get('/reports/history');
  return response.data;
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
