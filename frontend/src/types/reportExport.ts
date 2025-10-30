export interface ExportRequestDto {
  reportType: 'Devices' | 'Repairs' | 'Incidents' | 'Liquidation';
  format: 'Excel' | 'PDF';
  fromDate?: string;
  toDate?: string;
  saveToHistory?: boolean;
  filters?: Record<string, string>;
}

export interface ReportExportDto {
  id: string;
  reportType: string;
  exportDate: string;
  exportedByName: string;
  fileUrl?: string;
}
