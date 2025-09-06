import axiosInstance from './axios';
export const getUsers = () => axiosInstance.get('/users', { params: { isDeleted: false } });
export const getUserById = (id) => axiosInstance.get(`/users/${id}`);
export const getUserProfile = () => axiosInstance.get('/users/profile');
export const createUser = (data) => axiosInstance.post('/users', data);
export const updateUser = (id, data) => axiosInstance.put(`/users/${id}`, data);
export const updateUserProfile = (data) => axiosInstance.put('/users/profile', data);
export const deleteUser = (id) => axiosInstance.delete(`/users/${id}`);
export const restoreUser = (id) => axiosInstance.put(`/users/${id}/restore`);
export const getAllUsersData = async (includeDeleted = true) => {
    const res = await axiosInstance.get('/users', {
        params: includeDeleted ? {} : { isDeleted: false },
    });
    return res.data; // ✅ trả về mảng luôn
};
