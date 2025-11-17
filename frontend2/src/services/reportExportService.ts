import api from './api'
import type { ExportRequestDto, ReportExportDto } from '@/types/reportExport'

// Export report and get blob
export const exportReport = async (request: ExportRequestDto): Promise<Blob> => {
  const response = await api.post('/reports/export', request, {
    responseType: 'blob',
  })
  return response.data
}

// Get export history
export const getExportHistory = async (): Promise<ReportExportDto[]> => {
  const response = await api.get<ReportExportDto[]>('/reports/history')
  return response.data
}

// Helper to download blob as file
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

