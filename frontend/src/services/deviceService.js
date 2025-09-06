// src/services/deviceService.ts
import axiosClient from './axios';
// Lấy tất cả thiết bị
export const getAllDevices = async () => {
    try {
        const response = await axiosClient.get('/Devices');
        return response.data;
    }
    catch (error) {
        console.error('❌ Lỗi khi lấy danh sách thiết bị:', error);
        return []; // Trả về mảng rỗng để tránh crash UI
    }
};
// Lấy thiết bị theo ID
export const getDeviceById = async (id) => {
    try {
        const response = await axiosClient.get(`/Devices/${id}`);
        return response.data;
    }
    catch (error) {
        console.error('❌ Lỗi khi lấy thiết bị theo ID:', error);
        return null;
    }
};
// Thêm mới thiết bị
export const createDevice = async (device) => {
    try {
        await axiosClient.post('/Devices', device);
        return true;
    }
    catch (error) {
        console.error('❌ Lỗi khi tạo thiết bị:', error);
        return false;
    }
};
// Cập nhật thiết bị
export const updateDevice = async (id, device) => {
    try {
        await axiosClient.put(`/Devices/${id}`, device);
        return true;
    }
    catch (error) {
        console.error('❌ Lỗi khi cập nhật thiết bị:', error);
        return false;
    }
};
// Xóa thiết bị
export const deleteDevice = async (id) => {
    try {
        await axiosClient.delete(`/Devices/${id}`);
        return true;
    }
    catch (error) {
        console.error('❌ Lỗi khi xóa thiết bị:', error);
        return false;
    }
};
