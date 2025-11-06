import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../utils/baseUrl';

// Create axios instance; baseURL will be injected per request
const apiClient = axios.create({
  baseURL: 'http://0.0.0.0',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor: Tự động gắn JWT token từ AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Inject dynamic baseURL per request
      const baseURL = await getApiBaseUrl();
      config.baseURL = baseURL;

      // Attach token if present
      const token = await AsyncStorage.getItem('token');
      if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // keep config; request may still succeed if absolute URL used
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

