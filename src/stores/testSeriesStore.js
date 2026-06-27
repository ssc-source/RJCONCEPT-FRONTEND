import { create } from 'zustand';
import api from '../services/api';

export const useTestSeriesStore = create((set) => ({
  items: [],
  meta: null,
  current: null,
  isLoading: false,
  error: null,
  async fetchTestSeries(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/test-series', { params });
      set({ items: response.data || [], meta: response.meta || null, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch test series', isLoading: false });
      throw error;
    }
  },
  async fetchTestSeriesById(id) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/test-series/${id}`);
      set({ current: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch test series', isLoading: false });
      throw error;
    }
  },
  async createTestSeries(payload) {
    const response = await api.post('/test-series', payload);
    set((state) => ({ items: [response.data, ...state.items] }));
    return response.data;
  },
  async updateTestSeries(id, payload) {
    const response = await api.put(`/test-series/${id}`, payload);
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? response.data : item)),
      current: state.current?.id === id ? response.data : state.current,
    }));
    return response.data;
  },
  async deleteTestSeries(id) {
    await api.delete(`/test-series/${id}`);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      current: state.current?.id === id ? null : state.current,
    }));
  },
}));
