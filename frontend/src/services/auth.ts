import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5264/api/Auth/login';

export interface TokenPayload {
  nameid: string; // ID người dùng (ClaimTypes.NameIdentifier)
  email: string;
  role: string;
  position?: string; // 👈 Thêm trường này để hỗ trợ phân quyền
  exp: number;
  iss: string;
  aud: string;
}

export function getAccessToken(): string | null {
  return localStorage.getItem('token');
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await axios.post(API_URL, { email, password });
  const token = response.data.token;
  localStorage.setItem('token', token);
  return token;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export function getUserFromToken(): TokenPayload | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload: TokenPayload = jwtDecode(token);
    return payload;
  } catch (error) {
    console.error('Lỗi khi giải mã token:', error);
    return null;
  }
}

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserRole = (): string | null => {
  const user = getUserFromToken();
  return user?.role || null;
};
