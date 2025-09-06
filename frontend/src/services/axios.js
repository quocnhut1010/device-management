// src/services/axios.ts
import axios from 'axios';
// Cấu hình Axios client với baseURL gốc
const axiosClient = axios.create({
    baseURL: 'http://localhost:5264/api',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor: Tự động gắn token nếu có
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
export default axiosClient;
