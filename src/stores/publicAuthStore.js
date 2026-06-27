import { create } from 'zustand';
import api from '../services/api';
import { clearLegacyToken, getPublicToken, setPublicToken } from '../utils/auth';

// Module-level guard: prevent concurrent/reentrant checkAuth calls
let _publicCheckInFlight = false;

export const usePublicAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      clearLegacyToken();
      const response = await api.post('/auth/login', { email, password }, { meta: { scope: 'public' } });
      const data = response;

      if (data.user?.role && data.user.role !== 'STUDENT') {
        setPublicToken(null);
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: 'This login is for students and customers only. Please use the admin portal.',
        });
        throw new Error('This login is for students and customers only.');
      }

      setPublicToken(data.token);

      set({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error?.response?.data?.message || error?.message || 'Unable to sign in with those credentials.',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {}, { meta: { scope: 'public' } });
    } catch (error) {}
    setPublicToken(null);
    set({ isAuthenticated: false, user: null, isLoading: false, error: null });
  },

  checkAuth: async () => {
    // Skip API call entirely when no session flag exists — avoids 401 spam
    // when visiting public pages without being logged in.
    if (!getPublicToken()) {
      set({ isAuthenticated: false, user: null, isLoading: false, error: null });
      return;
    }
    if (_publicCheckInFlight) return;
    _publicCheckInFlight = true;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/me', { meta: { scope: 'public' } });
      const user = response.user;
      if (user?.role !== 'STUDENT') {
        setPublicToken(null);
        set({ isAuthenticated: false, user: null, isLoading: false, error: null });
        return;
      }
      set({ isAuthenticated: true, user, isLoading: false, error: null });
    } catch (error) {
      // Cookie expired / invalid — clear the stale flag, don't retry
      setPublicToken(null);
      set({ isAuthenticated: false, user: null, isLoading: false, error: null });
    } finally {
      _publicCheckInFlight = false;
    }
  },
}));
