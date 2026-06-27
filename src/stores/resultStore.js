import { create } from 'zustand';
import api from '../services/api';

export const useResultStore = create((set) => ({
  results: [],
  meta: null,
  isLoading: false,
  error: null,
  async fetchResults(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/results/admin', { params, meta: { scope: 'admin' } });
      set({
        results: response.data || [],
        meta: response.meta || null,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch results', isLoading: false });
      throw error;
    }
  },
  async createResult(payload) {
    const response = await api.post('/results', payload, { meta: { scope: 'admin' } });
    set((state) => ({ results: [response.data, ...state.results] }));
    return response.data;
  },
  async updateResult(id, payload) {
    const response = await api.put(`/results/${id}`, payload, { meta: { scope: 'admin' } });
    set((state) => ({
      results: state.results.map((item) => (item.id === id ? response.data : item)),
    }));
    return response.data;
  },
  async deleteResult(id) {
    await api.delete(`/results/${id}`, { meta: { scope: 'admin' } });
    set((state) => ({
      results: state.results.filter((item) => item.id !== id),
    }));
  },
}));
