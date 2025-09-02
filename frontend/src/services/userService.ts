import axiosInstance from './axios';
import { UserDto, RegisterUserDto } from '../types/UserDto';

export const getUsers = () => axiosInstance.get<UserDto[]>('/users', { params: { isDeleted: false } });
export const getUserById = (id: string) => axiosInstance.get<UserDto>(`/users/${id}`);
export const getUserProfile = () => axiosInstance.get<UserDto>('/users/profile');
export const createUser = (data: RegisterUserDto) => axiosInstance.post<UserDto>('/users', data);
export const updateUser = (id: string, data: UserDto) => axiosInstance.put<UserDto>(`/users/${id}`, data);
export const updateUserProfile = (data: UserDto) => axiosInstance.put<UserDto>('/users/profile', data);
export const deleteUser = (id: string) => axiosInstance.delete(`/users/${id}`);
export const restoreUser = (id: string) =>
  axiosInstance.put(`/users/${id}/restore`);

export const getAllUsersData = async (includeDeleted: boolean = true) => {
  const res = await axiosInstance.get<UserDto[]>('/users', {
    params: includeDeleted ? {} : { isDeleted: false },
  });
  return res.data; // ✅ trả về mảng luôn
};


