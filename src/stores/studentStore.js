import { create } from 'zustand';
import api from './authStore';

export const useStudentStore = create((set) => ({
  students: [],
  isLoading: false,
  fetchStudents: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/students');
      set({ students: data.data || [], isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
  updateFeeStatus: async (id, feeStatus) => {
    try {
      await api.put(`/students/${id}/status`, { feeStatus });
      set((state) => ({
        students: state.students.map(s => s.id === id ? { ...s, feeStatus } : s)
      }));
    } catch (error) {
      console.error('Update fee error:', error);
    }
  }
}));
