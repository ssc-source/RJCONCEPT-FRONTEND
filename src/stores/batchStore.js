import { create } from 'zustand';
import api from '../services/api';

export const useBatchStore = create((set) => ({
  batches: [],
  meta: null,
  isLoading: false,
  error: null,
  async fetchBatches(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/batches', { params, meta: { scope: 'admin' } });
      const batches = Array.isArray(response?.data) ? response.data : [];
      set({
        batches,
        meta: response.meta || null,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch batches', isLoading: false });
      throw error;
    }
  },
  async createBatch(payload) {
    const response = await api.post('/batches', payload, { meta: { scope: 'admin' } });
    const batch = response?.data || response;
    set((state) => ({ batches: [batch, ...state.batches] }));
    return batch;
  },
  async updateBatch(id, payload) {
    const response = await api.put(`/batches/${id}`, payload, { meta: { scope: 'admin' } });
    const batch = response?.data || response;
    set((state) => ({
      batches: state.batches.map((item) => (item.id === id ? batch : item)),
    }));
    return batch;
  },
  async assignStudents(id, studentIds) {
    const response = await api.put(`/batches/${id}/assign-students`, { studentIds }, { meta: { scope: 'admin' } });
    const batch = response?.data || response;
    set((state) => ({
      batches: state.batches.map((item) => (item.id === id ? batch : item)),
    }));
    return batch;
  },
  async deleteBatch(id) {
    await api.delete(`/batches/${id}`, { meta: { scope: 'admin' } });
    set((state) => ({
      batches: state.batches.filter((batch) => batch.id !== id),
    }));
  },
}));
