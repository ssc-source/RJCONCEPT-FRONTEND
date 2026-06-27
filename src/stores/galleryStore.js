import { create } from 'zustand';
import api from '../services/api';

export const useGalleryStore = create((set) => ({
  items: [],
  meta: null,
  isLoading: false,
  error: null,
  async fetchGallery(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/gallery/admin', { params, meta: { scope: 'admin' } });
      set({ items: response.data || [], meta: response.meta || null, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch gallery', isLoading: false });
      throw error;
    }
  },
  async createGalleryItem(payload) {
    const response = await api.post('/gallery', payload, { meta: { scope: 'admin' } });
    set((state) => ({ items: [response.data, ...state.items] }));
    return response.data;
  },
  async updateGalleryItem(id, payload) {
    const response = await api.put(`/gallery/${id}`, payload, { meta: { scope: 'admin' } });
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? response.data : item)),
    }));
    return response.data;
  },
  async deleteGalleryItem(id) {
    await api.delete(`/gallery/${id}`, { meta: { scope: 'admin' } });
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
}));
