import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = 'http://localhost:5264/api/Auth/login';
export function getAccessToken() {
    return localStorage.getItem('token');
}
export const login = async (email, password) => {
    const response = await axios.post(API_URL, { email, password });
    const token = response.data.token;
    localStorage.setItem('token', token);
    return token;
};
export const logout = () => {
    localStorage.removeItem('token');
};
export const getToken = () => {
    return localStorage.getItem('token');
};
export function getUserFromToken() {
    const token = getAccessToken();
    if (!token)
        return null;
    try {
        const payload = jwtDecode(token);
        return payload;
    }
    catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        return null;
    }
}
export const isAuthenticated = () => {
    return !!getToken();
};
export const getUserRole = () => {
    const user = getUserFromToken();
    return user?.role || null;
};
