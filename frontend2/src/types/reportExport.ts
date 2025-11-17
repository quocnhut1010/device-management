export type ReportType = 'Devices' | 'Repairs' | 'Incidents' | 'Liquidation'

export type ExportFormat = 'Excel' | 'PDF'

export interface ExportRequestDto {
  reportType: ReportType
  format: ExportFormat
  fromDate?: string
  toDate?: string
  saveToHistory?: boolean
  filters?: Record<string, string>
}

export interface ReportExportDto {
  id: string
  reportType: string
  exportDate: string
  exportedByName: string
  fileUrl?: string
}

