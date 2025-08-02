import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse, LoginData, RegisterData } from '../utils/types';
import { authAPI } from '../utils/api';

// Safe localStorage wrapper
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
    }
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateInterests: (interests: string[]) => Promise<void>;
  clearError: () => void;
  resetAuth: () => void;
  error: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (data: LoginData) => {
        if (!data?.email || !data?.password) {
          set({ error: 'Email ve şifre gereklidir', isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(data);
          console.log('Login response received:', response);
          
          if (!response?.user || !response?.access_token) {
            console.error('Invalid response structure:', response);
            throw new Error('Geçersiz sunucu yanıtı');
          }
          
          console.log('Setting auth state with token:', response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false
          });
          
          console.log('Auth state set successfully');
          
          // Debug: Check if localStorage was updated
          setTimeout(() => {
            const stored = localStorage.getItem('auth-storage');
            console.log('After setting state, localStorage contains:', stored);
          }, 100);
        } catch (error: any) {
          console.error('Login error:', error);
          set({
            error: error.message || 'Giriş yapılırken hata oluştu',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
        }
      },

      register: async (data: RegisterData) => {
        if (!data?.email || !data?.password || !data?.name) {
          set({ error: 'Tüm alanlar gereklidir', isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          
          if (!response?.user || !response?.access_token) {
            throw new Error('Geçersiz sunucu yanıtı');
          }
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          console.error('Register error:', error);
          set({
            error: error.message || 'Kayıt olurken hata oluştu',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null
          });
        }
      },

      logout: () => {
        try {
          safeStorage.removeItem('auth-storage');
        } catch (error) {
          console.warn('Error clearing auth storage during logout:', error);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      updateInterests: async (interests: string[]) => {
        const { user } = get();
        
        if (!user) {
          const errorMsg = 'Kullanıcı oturumu bulunamadı';
          console.error(errorMsg);
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }

        if (!Array.isArray(interests)) {
          const errorMsg = 'Geçersiz ilgi alanları formatı';
          console.error(errorMsg);
          set({ error: errorMsg });
          throw new Error(errorMsg);
        }

        // Validate interests
        const validInterests = interests
          .filter(interest => interest && typeof interest === 'string')
          .map(interest => interest.trim())
          .filter(interest => interest.length > 0);

        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateInterests(validInterests);
          
          if (!response?.user) {
            throw new Error('Geçersiz sunucu yanıtı');
          }
          
          set({
            user: { ...user, interests: validInterests },
            isLoading: false
          });
        } catch (error: any) {
          console.error('Error in updateInterests:', error);
          const errorMessage = error.message || 'İlgi alanları güncellenirken hata oluştu';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw new Error(errorMessage);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      resetAuth: () => {
        try {
          localStorage.removeItem('auth-storage');
          console.log('Auth storage cleared');
        } catch (error) {
          console.warn('Error clearing auth storage:', error);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name: string) => {
          try {
            const value = localStorage.getItem(name);
            console.log('Storage getItem:', name, value);
            return value;
          } catch (error) {
            console.warn('Storage getItem failed:', error);
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            console.log('Storage setItem - name:', name);
            console.log('Storage setItem - value type:', typeof value);
            console.log('Storage setItem - value:', value);
            
            // Ensure we're storing a string
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(name, stringValue);
            
            // Verify storage
            const stored = localStorage.getItem(name);
            console.log('Verified stored value:', stored);
          } catch (error) {
            console.warn('Storage setItem failed:', error);
          }
        },
        removeItem: (name: string) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.warn('Storage removeItem failed:', error);
          }
        },
      },
      partialize: (state) => {
        const partialState = {
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        };
        console.log('Partializing state:', partialState);
        return partialState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Zustand rehydration error:', error);
          // Clear corrupted storage
          try {
            localStorage.removeItem('auth-storage');
          } catch (clearError) {
            console.warn('Could not clear corrupted storage:', clearError);
          }
          return;
        }

        console.log('Zustand rehydrating state:', state);
        
        // Validate rehydrated state
        if (state) {
          try {
            // Validate token format
            if (state.token && (typeof state.token !== 'string' || state.token.length < 10)) {
              console.warn('Invalid token format, clearing auth');
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
            }
            
            // Check if token exists but user doesn't, or vice versa
            else if ((state.token && !state.user) || (!state.token && state.user)) {
              console.warn('Inconsistent auth state detected, clearing storage');
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
            }
            
            // Validate user object structure if it exists
            else if (state.user && (typeof state.user !== 'object' || !state.user.id || !state.user.email)) {
              console.warn('Invalid user object in storage, clearing');
              state.user = null;
              state.token = null;
              state.isAuthenticated = false;
            }
            
            // Ensure isAuthenticated is consistent with token/user presence
            else if (state.isAuthenticated !== (!!state.token && !!state.user)) {
              console.warn('Fixing inconsistent isAuthenticated state');
              state.isAuthenticated = !!(state.token && state.user);
            }
            
            console.log('Final rehydrated state:', {
              hasToken: !!state.token,
              hasUser: !!state.user,
              isAuthenticated: state.isAuthenticated
            });
          } catch (validationError) {
            console.error('Error validating rehydrated auth state:', validationError);
            // Reset to safe state
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
          }
        } else {
          console.log('No state to rehydrate, starting with clean state');
        }
      }
    }
  )
);