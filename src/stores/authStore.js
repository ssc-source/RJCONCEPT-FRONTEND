import { create } from 'zustand';
import axios from 'axios';
import { clearLegacyToken, getAdminToken, setAdminToken } from '../utils/auth';

const resolveApiBaseUrl = () => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!raw) return '';

  const normalized = raw.replace(/\/+$/, '');
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
};

// Module-level guard: prevent concurrent/reentrant checkAuth calls
let _adminCheckInFlight = false;

// Initialize the core Axios interceptor instance
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

const ADMIN_SCOPE_HEADERS = { 'x-auth-scope': 'admin' };

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  config.headers = {
    ...config.headers,
    ...ADMIN_SCOPE_HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (typeof window !== 'undefined' && status === 401) {
      const requestUrl = error?.config?.url || '';
      const isRefreshRequest = requestUrl.includes('/auth/refresh');
      const isAuthEntryRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
      if (!isRefreshRequest && !isAuthEntryRequest && !error?.config?._retry) {
        error.config._retry = true;
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: ADMIN_SCOPE_HEADERS,
            }
          );
          if (response?.data?.token) {
            setAdminToken(response.data.token);
          }
          return api(error.config);
        } catch (refreshError) {
          setAdminToken(null);
          return Promise.reject(refreshError);
        }
      }

      setAdminToken(null);
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      clearLegacyToken();
      const { data } = await api.post('/auth/login', { email, password }, { headers: ADMIN_SCOPE_HEADERS });
      if (data.user?.role === 'STUDENT') {
        setAdminToken(null);
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'Student accounts cannot access the admin portal.',
        });
        throw new Error('Student accounts cannot access the admin portal.');
      }
      setAdminToken(data.token);
      set({ isAuthenticated: true, user: data.user, isLoading: false, error: null });
      return data;
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error.response?.data?.message || 'Unable to sign in with those credentials.'
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {}, { headers: ADMIN_SCOPE_HEADERS });
    } catch (error) {}
    setAdminToken(null);
    set({ isAuthenticated: false, user: null, isLoading: false, error: null });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    if (!getAdminToken()) {
      set({ isAuthenticated: false, user: null, isLoading: false, error: null });
      return;
    }
    if (_adminCheckInFlight) return;
    _adminCheckInFlight = true;
    set({ isLoading: true });
    try {
      const { data } = await api.get('/auth/me', { headers: ADMIN_SCOPE_HEADERS });
      if (data.user?.role === 'STUDENT') {
        set({ isAuthenticated: false, user: null, isLoading: false, error: null });
        return;
      }
      set({ isAuthenticated: true, user: data.user, isLoading: false, error: null });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false, error: null });
    } finally {
      _adminCheckInFlight = false;
    }
  }
}));

// Provide the identical default export expected by admin modules
export default api;
