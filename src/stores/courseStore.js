import { create } from 'zustand';
import api from '../services/api';

export const useCourseStore = create((set) => ({
  courses: [],
  meta: null,
  isLoading: false,
  error: null,
  async fetchCourses(params = {}) {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/courses', { params });
      set({
        courses: response.data || [],
        meta: response.meta || null,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ error: error.message || 'Failed to fetch courses', isLoading: false });
      throw error;
    }
  },
  async createCourse(payload) {
    const response = await api.post('/courses', payload, { meta: { scope: 'admin' } });
    set((state) => ({ courses: [response.data, ...state.courses] }));
    return response.data;
  },
  async updateCourse(id, payload) {
    const response = await api.put(`/courses/${id}`, payload, { meta: { scope: 'admin' } });
    set((state) => ({
      courses: state.courses.map((course) => (course.id === id ? response.data : course)),
    }));
    return response.data;
  },
  async deleteCourse(id) {
    await api.delete(`/courses/${id}`, { meta: { scope: 'admin' } });
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== id),
    }));
  },
}));
