import { create } from 'zustand';
import api from '../services/api';

export const useFacultyStore = create((set) => ({
  faculties: [],
  isLoading: false,
  error: null,
  async fetchFaculties(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/faculty', { params });
      set({ faculties: response.data || [], isLoading: false });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch faculty', isLoading: false });
      throw error;
    }
  },
  async addFaculty(facultyData) {
    const response = await api.post('/faculty', facultyData, { meta: { scope: 'admin' } });
    set((state) => ({ faculties: [response.data, ...state.faculties] }));
    return response.data;
  },
  async updateFaculty(id, payload) {
    const response = await api.put(`/faculty/${id}`, payload, { meta: { scope: 'admin' } });
    set((state) => ({
      faculties: state.faculties.map((faculty) => (faculty.id === id ? response.data : faculty)),
    }));
    return response.data;
  },
  async deleteFaculty(id) {
    await api.delete(`/faculty/${id}`, { meta: { scope: 'admin' } });
    set((state) => ({
      faculties: state.faculties.filter((faculty) => faculty.id !== id),
    }));
  },
}));
