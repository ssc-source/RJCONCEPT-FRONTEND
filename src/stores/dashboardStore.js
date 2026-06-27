import { create } from 'zustand';
import api from '../services/api';

export const useDashboardStore = create((set) => ({
  summary: null,
  isLoading: false,
  error: null,
  async fetchSummary() {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard', { meta: { scope: 'admin' } });
      const payload = response?.data || response;
      set({ summary: payload, isLoading: false });
      return payload;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch dashboard data', isLoading: false });
      throw error;
    }
  },
}));
