import { create } from 'zustand';
import api from '../services/api';

export const useNoticeStore = create((set) => ({
  notices: [],
  meta: null,
  isLoading: false,
  error: null,
  async fetchNotices(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notices', { params });
      set({ notices: response.data || [], meta: response.meta || null, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch notices', isLoading: false });
      throw error;
    }
  },
  async createNotice(payload) {
    const response = await api.post('/notices', payload);
    set((state) => ({ notices: [response.data, ...state.notices] }));
    return response.data;
  },
  async updateNotice(id, payload) {
    const response = await api.put(`/notices/${id}`, payload);
    set((state) => ({
      notices: state.notices.map((notice) => (notice.id === id ? response.data : notice)),
    }));
    return response.data;
  },
  async deleteNotice(id) {
    await api.delete(`/notices/${id}`);
    set((state) => ({
      notices: state.notices.filter((notice) => notice.id !== id),
    }));
  },
}));
