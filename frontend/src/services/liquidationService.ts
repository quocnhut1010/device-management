import axios from './axios';
import {
  LiquidationDto,
  CreateLiquidationDto,
  BatchLiquidationDto,
  EligibleDeviceDto
} from '../types/liquidation';

export const liquidationService = {
  // ✅ 1. Lấy danh sách thiết bị đủ điều kiện thanh lý
  getEligibleDevices: async (): Promise<EligibleDeviceDto[]> => {
    const response = await axios.get('/liquidation/eligible-devices');
    return response.data;
  },

  // ✅ 2. Kiểm tra thiết bị có đủ điều kiện thanh lý không
  // Backend của bạn định nghĩa route: [HttpGet("eligible/{deviceId}")]
  checkEligibility: async (deviceId: string): Promise<{ eligible: boolean }> => {
    const response = await axios.get(`/liquidation/eligible/${deviceId}`);
    return response.data;
  },

  // ✅ 3. Thanh lý 1 thiết bị
  liquidateDevice: async (data: CreateLiquidationDto): Promise<LiquidationDto> => {
    const response = await axios.post('/liquidation/single', data);
    return response.data;
  },

  // ✅ 4. Thanh lý nhiều thiết bị cùng lúc
  liquidateBatch: async (data: BatchLiquidationDto): Promise<LiquidationDto[]> => {
    const response = await axios.post('/liquidation/batch', data);
    return response.data.liquidations; // backend trả về { message, liquidations }
  },

  // ✅ 5. Lấy toàn bộ lịch sử thanh lý
  getLiquidationHistory: async (): Promise<LiquidationDto[]> => {
    const response = await axios.get('/liquidation/history');
    return response.data;
  },

  // ✅ 6. Lấy chi tiết một bản ghi thanh lý
  getLiquidationById: async (liquidationId: string): Promise<LiquidationDto> => {
    const response = await axios.get(`/liquidation/${liquidationId}`);
    return response.data;
  },
};

export default liquidationService;
