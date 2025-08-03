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
    (set, get) => {
      console.log('🏪 Auth store initializing...');
      return {
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
        if (!data?.email || !data?.password) {
          set({ error: 'Email ve şifre gereklidir', isLoading: false });
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
    };
  },
    {
      name: 'auth-storage',
      storage: {
        getItem: (name: string) => {
          try {
            return localStorage.getItem(name);
          } catch (error) {
            console.warn('Storage getItem failed:', error);
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(name, stringValue);
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state, error) => {
        console.log('🔄 Zustand rehydrating...', { state, error });
        
        if (error) {
          console.error('❌ Rehydration error:', error);
          try {
            localStorage.removeItem('auth-storage');
          } catch (clearError) {
            console.warn('Could not clear corrupted storage:', clearError);
          }
          return;
        }

        if (state) {
          console.log('📦 Rehydrating state:', {
            hasUser: !!state.user,
            hasToken: !!state.token,
            isAuthenticated: state.isAuthenticated,
            tokenLength: state.token?.length,
            userStructure: state.user ? Object.keys(state.user) : null
          });
          
          // If no state but localStorage has data, try to restore manually
          if (!state.user && !state.token) {
            console.log('🔧 Empty state detected, checking localStorage manually...');
            try {
              const storedData = localStorage.getItem('auth-storage');
              if (storedData) {
                const parsed = JSON.parse(storedData);
                console.log('📱 Manual localStorage check:', parsed);
                
                if (parsed.state && parsed.state.user && parsed.state.token) {
                  console.log('🔄 Restoring state from localStorage manually');
                  state.user = parsed.state.user;
                  state.token = parsed.state.token;
                  state.isAuthenticated = parsed.state.isAuthenticated;
                }
              }
            } catch (e) {
              console.warn('Failed to manually restore from localStorage:', e);
            }
          }
          
          // Validate auth state consistency
          const hasValidToken = state.token && typeof state.token === 'string' && state.token.length > 10;
          const hasValidUser = state.user && typeof state.user === 'object' && 
            (state.user.id || (state.user as any)._id) && state.user.email;
          
          console.log('🔍 Validation details:', {
            hasValidToken,
            hasValidUser,
            userKeys: state.user ? Object.keys(state.user) : null,
            userId: state.user?.id || (state.user as any)?._id,
            userEmail: state.user?.email
          });
          
          if (hasValidToken && hasValidUser) {
            state.isAuthenticated = true;
            console.log('✅ Auth state valid, user authenticated');
          } else {
            console.log('❌ Invalid auth state - not clearing immediately to prevent logout loops');
            // Don't clear state immediately to prevent constant logout loops
            // Just mark as not authenticated but keep the token for debugging
            state.isAuthenticated = false;
          }
        } else {
          console.log('🆕 No state to rehydrate, checking localStorage manually...');
          // Manual fallback when Zustand fails completely
          try {
            const storedData = localStorage.getItem('auth-storage');
            if (storedData) {
              const parsed = JSON.parse(storedData);
              console.log('📱 Fallback localStorage data:', parsed);
            }
          } catch (e) {
            console.warn('Failed fallback localStorage check:', e);
          }
        }
      }
    }
  )
);