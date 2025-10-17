import axiosClient from './axios';
import {
  DeviceHistoryData,
  DeviceHistoryFilter,
  DeviceHistoryTimelineData,
  DeviceHistoryStats,
  CreateDeviceHistoryData,
  BulkDeviceHistoryData
} from '../types/deviceHistory';

export class DeviceHistoryService {
  // Get device history by device ID
  static async getDeviceHistory(
    deviceId: string,
    filters?: DeviceHistoryFilter
  ): Promise<DeviceHistoryData[]> {
    const params = new URLSearchParams();
    
    if (filters?.action) params.append('action', filters.action);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosClient.get(
      `/devicehistory/device/${deviceId}?${params.toString()}`
    );
    return response.data;
  }

  // Get user history by user ID
  static async getUserHistory(
    userId: string,
    filters?: DeviceHistoryFilter
  ): Promise<DeviceHistoryData[]> {
    const params = new URLSearchParams();
    
    if (filters?.action) params.append('action', filters.action);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosClient.get(
      `/devicehistory/user/${userId}?${params.toString()}`
    );
    return response.data;
  }

  // Get current user's history
  static async getMyHistory(filters?: DeviceHistoryFilter): Promise<DeviceHistoryData[]> {
    const params = new URLSearchParams();
    
    if (filters?.action) params.append('action', filters.action);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosClient.get(
      `/devicehistory/my-history?${params.toString()}`
    );
    return response.data;
  }

  // Get all history (Admin/Manager only)
  static async getAllHistory(filters: DeviceHistoryFilter): Promise<DeviceHistoryData[]> {
    const params = new URLSearchParams();
    
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.action) params.append('action', filters.action);
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await axiosClient.get(`/devicehistory?${params.toString()}`);
    return response.data;
  }

  // Get history timeline
  static async getHistoryTimeline(filters?: DeviceHistoryFilter): Promise<DeviceHistoryTimelineData[]> {
    const params = new URLSearchParams();
    
    if (filters?.deviceId) params.append('deviceId', filters.deviceId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    const response = await axiosClient.get(`/devicehistory/timeline?${params.toString()}`);
    return response.data;
  }

  // Get history statistics
  static async getHistoryStats(
    deviceId?: string,
    userId?: string,
    fromDate?: string
  ): Promise<DeviceHistoryStats> {
    const params = new URLSearchParams();
    
    if (deviceId) params.append('deviceId', deviceId);
    if (userId) params.append('userId', userId);
    if (fromDate) params.append('fromDate', fromDate);

    const response = await axiosClient.get(`/devicehistory/stats?${params.toString()}`);
    return response.data;
  }

  // Get specific history record by ID
  static async getHistoryById(id: string): Promise<DeviceHistoryData> {
    const response = await axiosClient.get(`/devicehistory/${id}`);
    return response.data;
  }

  // Log a new action
  static async logAction(data: CreateDeviceHistoryData): Promise<void> {
    await axiosClient.post('/devicehistory', data);
  }

  // Log multiple actions in bulk
  static async logBulkActions(data: BulkDeviceHistoryData): Promise<void> {
    await axiosClient.post('/devicehistory/bulk', data);
  }

  // Get available actions for filtering
  static async getAvailableActions(): Promise<string[]> {
    const response = await axiosClient.get('/devicehistory/available-actions');
    return response.data;
  }

  // Get available action types for filtering
  static async getAvailableActionTypes(): Promise<string[]> {
    const response = await axiosClient.get('/devicehistory/available-action-types');
    return response.data;
  }

  // Delete a history record (Admin only)
  static async deleteHistory(id: string): Promise<void> {
    await axiosClient.delete(`/devicehistory/${id}`);
  }

  // Clean up old history records (Admin only)
  static async cleanupOldHistory(beforeDate: string): Promise<string> {
    const response = await axiosClient.delete(
      `/devicehistory/cleanup?beforeDate=${beforeDate}`
    );
    return response.data;
  }
}

export default DeviceHistoryService;