import axios, { AxiosError } from 'axios';
import type { AuthResponse, LoginData, RegisterData, SummaryResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Network status checker
let isOnline = navigator.onLine;
window.addEventListener('online', () => { isOnline = true; });
window.addEventListener('offline', () => { isOnline = false; });

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry mechanism
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (error: AxiosError, retryCount = 0): Promise<any> => {
  if (retryCount >= MAX_RETRIES) {
    throw error;
  }

  // Only retry on network errors or 5xx server errors
  if (error.code === 'NETWORK_ERROR' || 
      error.code === 'ECONNABORTED' ||
      (error.response && error.response.status >= 500)) {
    
    await sleep(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
    return api.request({ ...error.config, retryCount: retryCount + 1 });
  }

  throw error;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Check network connectivity
    if (!isOnline) {
      return Promise.reject(new Error('No network connection'));
    }

    // Add auth token if available
    try {
      const authStorage = localStorage.getItem('auth-storage');
      console.log('🔑 API interceptor - raw storage:', authStorage);
      
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const state = parsed?.state || parsed; // Handle both formats
        console.log('🔑 API interceptor - parsed state:', {
          hasToken: !!state?.token,
          isAuthenticated: state?.isAuthenticated,
          tokenPreview: state?.token?.substring(0, 20) + '...'
        });
        
        if (state?.token && state?.isAuthenticated) {
          config.headers.Authorization = `Bearer ${state.token}`;
          console.log('✅ Authorization header added');
        } else {
          console.log('❌ No valid auth token found');
        }
      } else {
        console.log('🔑 No auth storage found');
      }
    } catch (error) {
      console.warn('Error parsing auth storage:', error);
      // Clear corrupted storage
      try {
        localStorage.removeItem('auth-storage');
      } catch (clearError) {
        console.warn('Could not clear corrupted auth storage:', clearError);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized received!', {
        url: error.config?.url,
        method: error.config?.method,
        currentPath: window.location.pathname
      });
      try {
        localStorage.removeItem('auth-storage');
        // Only redirect if we're not already on auth pages
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          console.log('🔄 Redirecting to login due to 401');
          window.location.href = '/login';
        } else {
          console.log('⏭️ Already on auth page, not redirecting');
        }
      } catch (storageError) {
        console.warn('Error clearing auth storage:', storageError);
      }
      return Promise.reject(error);
    }

    // Handle network errors and server errors with retry
    const config = error.config as any;
    if (!config.retryCount) {
      try {
        return await retryRequest(error);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

// Error handler utility
const handleApiError = (error: any, fallbackMessage: string) => {
  if (!isOnline) {
    throw new Error('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.');
  }
  
  if (error.code === 'ECONNABORTED') {
    throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
  }
  
  const message = error.response?.data?.message || 
                  error.message || 
                  fallbackMessage;
  throw new Error(message);
};

// Auth API calls with error handling
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Giriş yapılırken hata oluştu');
      throw error; // This won't be reached due to throw in handleApiError
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Kayıt olurken hata oluştu');
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Profil bilgileri alınırken hata oluştu');
      throw error;
    }
  },

  updateInterests: async (interests: string[]) => {
    try {
      const response = await api.patch('/auth/interests', { interests });
      return response.data;
    } catch (error) {
      handleApiError(error, 'İlgi alanları güncellenirken hata oluştu');
      throw error;
    }
  }
};

// AI API calls with error handling
export const aiAPI = {
  summarizeText: async (text: string): Promise<SummaryResult> => {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Özetlenecek metin boş olamaz');
      }
      const response = await api.post('/ai/summarize', { text });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Metin özetlenirken hata oluştu');
      throw error;
    }
  },

  testConnection: async () => {
    try {
      const response = await api.get('/ai/test');
      return response.data;
    } catch (error) {
      handleApiError(error, 'AI bağlantısı test edilirken hata oluştu');
      throw error;
    }
  }
};

// Network status utility
export const networkUtils = {
  isOnline: () => isOnline,
  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await fetch('/ping', { 
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

export { api };
export default api;