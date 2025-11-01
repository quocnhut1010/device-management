import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import apiClient from './api';

const TOKEN_KEY = 'token';

export interface TokenPayload {
  nameid: string; // User ID
  email: string;
  role: string;
  position?: string;
  exp: number;
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await apiClient.post('/Auth/login', { email, password });
  const token = response.data.token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  return token;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getUserFromToken = async (): Promise<TokenPayload | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    const payload: TokenPayload = jwtDecode(token);
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};

export const getUserRole = async (): Promise<string | null> => {
  const user = await getUserFromToken();
  return user?.role || null;
};

export const getUserPosition = async (): Promise<string | null> => {
  const user = await getUserFromToken();
  return user?.position || null;
};

export const getUserId = async (): Promise<string | null> => {
  const user = await getUserFromToken();
  return user?.nameid || null;
};

