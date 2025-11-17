import api from './api'
import type {
  LiquidationDto,
  CreateLiquidationDto,
  BatchLiquidationDto,
  EligibleDeviceDto,
  DeviceEligibilityDto,
} from '@/types/liquidation'

const LIQUIDATION_API_BASE = '/liquidation'

export const liquidationService = {
  // Lấy danh sách thiết bị đủ điều kiện thanh lý
  async getEligibleDevices(): Promise<EligibleDeviceDto[]> {
    try {
      const response = await api.get<EligibleDeviceDto[]>(`${LIQUIDATION_API_BASE}/eligible-devices`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching eligible devices:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch eligible devices')
    }
  },

  // Kiểm tra thiết bị có đủ điều kiện thanh lý không
  async checkEligibility(deviceId: string): Promise<{ eligible: boolean }> {
    try {
      const response = await api.get<{ eligible: boolean }>(`${LIQUIDATION_API_BASE}/eligible/${deviceId}`)
      return response.data
    } catch (error: any) {
      console.error('Error checking eligibility:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to check eligibility')
    }
  },

  // Thanh lý 1 thiết bị
  async liquidateDevice(data: CreateLiquidationDto): Promise<LiquidationDto> {
    try {
      const response = await api.post<LiquidationDto>(`${LIQUIDATION_API_BASE}/single`, data)
      return response.data
    } catch (error: any) {
      console.error('Error liquidating device:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to liquidate device')
    }
  },

  // Thanh lý nhiều thiết bị cùng lúc
  async liquidateBatch(data: BatchLiquidationDto): Promise<LiquidationDto[]> {
    try {
      const response = await api.post<{ message: string; liquidations: LiquidationDto[] }>(
        `${LIQUIDATION_API_BASE}/batch`,
        data
      )
      return response.data.liquidations
    } catch (error: any) {
      console.error('Error liquidating batch:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to liquidate batch')
    }
  },

  // Lấy toàn bộ lịch sử thanh lý
  async getLiquidationHistory(): Promise<LiquidationDto[]> {
    try {
      const response = await api.get<LiquidationDto[]>(`${LIQUIDATION_API_BASE}/history`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching liquidation history:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch liquidation history')
    }
  },

  // Lấy chi tiết một bản ghi thanh lý
  async getLiquidationById(liquidationId: string): Promise<LiquidationDto> {
    try {
      const response = await api.get<LiquidationDto>(`${LIQUIDATION_API_BASE}/${liquidationId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching liquidation details:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch liquidation details')
    }
  },
}

export default liquidationService

