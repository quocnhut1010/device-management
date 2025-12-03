import api from './api'

export interface AIReportRequest {
  query: string
}

export interface AIReportResponse {
  isReportQuery: boolean
  exportRequest?: {
    reportType: string
    format: string
    fromDate?: string
    toDate?: string
    filters?: Record<string, string>
  }
  message?: string
  error?: string
  fileData?: string // Base64 encoded file data
  fileName?: string
  contentType?: string
}

export interface AIReportFileResponse {
  isReportQuery: boolean
  message?: string
  error?: string
  fileBlob?: Blob
  fileName?: string
}

/**
 * Process a natural language report query and get the export file
 */
export const processReportQuery = async (query: string): Promise<AIReportFileResponse> => {
  try {
    const response = await api.post<AIReportResponse>('/ai-reports/process', { query })

    const jsonResponse = response.data

    if (!jsonResponse.isReportQuery) {
      return {
        isReportQuery: false,
        message: jsonResponse.message
      }
    }

    if (jsonResponse.error) {
      return {
        isReportQuery: true,
        error: jsonResponse.error
      }
    }

    // If file data is present (base64 encoded), decode it
    if (jsonResponse.fileData && jsonResponse.fileName && jsonResponse.contentType) {
      // Convert base64 to blob
      const byteCharacters = atob(jsonResponse.fileData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: jsonResponse.contentType })

      return {
        isReportQuery: true,
        fileBlob: blob,
        fileName: jsonResponse.fileName,
        message: jsonResponse.message || 'Đã tạo báo cáo thành công!'
      }
    }

    // Just a message response
    return {
      isReportQuery: true,
      message: jsonResponse.message || 'Đã xử lý yêu cầu báo cáo'
    }
  } catch (error: any) {
    console.error('Error processing report query:', error)
    
    // Handle error responses
    if (error.response) {
      const errorData = error.response.data
      
      if (typeof errorData === 'object' && errorData.error) {
        return {
          isReportQuery: errorData.isReportQuery !== false,
          error: errorData.error || 'Đã xảy ra lỗi khi xử lý yêu cầu'
        }
      }
    }

    return {
      isReportQuery: true,
      error: error.message || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'
    }
  }
}

/**
 * Helper to download a blob as a file
 */
export const downloadReportFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

