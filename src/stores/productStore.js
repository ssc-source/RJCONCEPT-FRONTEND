import { create } from 'zustand';
import api from '../services/api';

export const useProductStore = create((set) => ({
  products: [],
  meta: null,
  isLoading: false,
  error: null,
  async fetchProducts(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/products', { params });
      set({ products: response.data || [], meta: response.meta || null, isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
      throw error;
    }
  },
  async createProduct(payload) {
    const response = await api.post('/products', payload);
    set((state) => ({ products: [response.data, ...state.products] }));
    return response.data;
  },
  async updateProduct(id, payload) {
    const response = await api.put(`/products/${id}`, payload);
    set((state) => ({
      products: state.products.map((product) => (product.id === id ? response.data : product)),
    }));
    return response.data;
  },
  async deleteProduct(id) {
    await api.delete(`/products/${id}`);
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
  },
}));
