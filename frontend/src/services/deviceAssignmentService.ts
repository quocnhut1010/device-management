import axios from './axios'; // đã có sẵn axiosInstance cấu hình baseURL, token
import {
  CreateDeviceAssignmentDto,
  DeviceAssignmentDto,
  TransferDeviceAssignmentDto,
  DeviceAssignmentFilters,
} from '../types/deviceAssignment';

const API_URL = '/deviceassignment';

export const getAllAssignments = async (): Promise<DeviceAssignmentDto[]> => {
  try {
    const res = await axios.get(`${API_URL}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getUnassignedDevices = async (filters?: DeviceAssignmentFilters): Promise<DeviceAssignmentDto[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.deviceCode) {
      params.append('deviceCode', filters.deviceCode);
    }
    if (filters?.modelName) {
      params.append('modelName', filters.modelName);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    const queryString = params.toString();
    const url = queryString ? `${API_URL}/unassigned?${queryString}` : `${API_URL}/unassigned`;
    
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getInUseDevices = async (): Promise<DeviceAssignmentDto[]> => {
  try {
    const res = await axios.get(`${API_URL}/inuse`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createAssignment = async (data: CreateDeviceAssignmentDto): Promise<DeviceAssignmentDto> => {
  try {
    const res = await axios.post(`${API_URL}`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const transferAssignment = async (
  data: TransferDeviceAssignmentDto
): Promise<DeviceAssignmentDto> => {
  const payload = {
    OldAssignmentId: data.oldAssignmentId,
    NewUserId: data.newUserId,
    NewDepartmentId: data.newDepartmentId,
    Note: data.note
  };
  const res = await axios.post(`${API_URL}/transfer`, payload);
  return res.data;
};

export const revokeAssignment = async (assignmentId: string): Promise<void> => {
  await axios.post(`${API_URL}/${assignmentId}/revoke`);
};
