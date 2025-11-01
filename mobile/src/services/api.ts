import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Temporarily hardcoded for testing. Will migrate to Expo Constants later
const API_BASE_URL = 'http://192.168.1.10:5264/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động gắn JWT token từ AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export default apiClient;

