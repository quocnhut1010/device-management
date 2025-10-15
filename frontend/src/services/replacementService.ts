import axios from './axios';
import { 
  ReplacementDto, 
  CreateReplacementDto, 
  SuggestedDeviceDto,
  ReplacementFilters 
} from '../types/replacement';

/**
 * Service for handling device replacement operations
 */

// Lấy danh sách thiết bị được đề xuất cho việc thay thế (cùng model)
export const getSuggestedReplacementDevices = async (oldDeviceId: string): Promise<SuggestedDeviceDto[]> => {
  const response = await axios.get(`/replacement/suggested-devices/${oldDeviceId}`);
  return response.data;
};

// Lấy tất cả thiết bị có sẵn cho việc thay thế
export const getAllAvailableDevices = async (): Promise<SuggestedDeviceDto[]> => {
  const response = await axios.get('/replacement/available-devices');
  return response.data;
};

// Tạo replacement request và thực hiện thay thế thiết bị
export const createReplacement = async (createReplacementDto: CreateReplacementDto): Promise<ReplacementDto> => {
  const response = await axios.post('/replacement', createReplacementDto);
  return response.data;
};

// Lấy thông tin replacement theo ID
export const getReplacementById = async (id: string): Promise<ReplacementDto> => {
  const response = await axios.get(`/replacement/${id}`);
  return response.data;
};

// Lấy lịch sử thay thế thiết bị
export const getReplacementHistory = async (filters?: ReplacementFilters): Promise<ReplacementDto[]> => {
  const params = new URLSearchParams();
  
  if (filters?.deviceId) {
    params.append('deviceId', filters.deviceId);
  }
  
  const url = params.toString() ? `/replacement/history?${params.toString()}` : '/replacement/history';
  const response = await axios.get(url);
  return response.data;
};

// Helper functions for frontend logic

/**
 * Format replacement date for display
 */
export const formatReplacementDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

/**
 * Get replacement status text in Vietnamese
 */
export const getReplacementStatusText = (replacement: ReplacementDto): string => {
  if (replacement.replacementDate) {
    return 'Đã hoàn thành';
  }
  return 'Đang xử lý';
};

/**
 * Filter suggested devices by criteria
 */
export const filterSuggestedDevices = (
  devices: SuggestedDeviceDto[], 
  searchTerm?: string,
  showSameModelOnly?: boolean
): SuggestedDeviceDto[] => {
  let filtered = [...devices];
  
  if (showSameModelOnly) {
    filtered = filtered.filter(device => device.isSameModel);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(device => 
      device.deviceCode.toLowerCase().includes(term) ||
      device.deviceName.toLowerCase().includes(term) ||
      device.modelName.toLowerCase().includes(term) ||
      device.typeName.toLowerCase().includes(term)
    );
  }
  
  return filtered;
};

/**
 * Sort devices by priority (same model first, then by purchase date)
 */
export const sortDevicesByPriority = (devices: SuggestedDeviceDto[]): SuggestedDeviceDto[] => {
  return [...devices].sort((a, b) => {
    // Same model devices first
    if (a.isSameModel && !b.isSameModel) return -1;
    if (!a.isSameModel && b.isSameModel) return 1;
    
    // Then by purchase date (newer first)
    const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
    const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
    
    return dateB - dateA;
  });
};