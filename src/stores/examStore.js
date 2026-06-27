import { create } from 'zustand';
import api from './authStore';

export const useExamStore = create((set) => ({
  exams: [],
  isLoading: false,
  fetchExams: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/exams');
      set({ exams: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
  createExamStub: async (examData) => {
    try {
      const { data } = await api.post('/exams', examData);
      set((state) => ({ exams: [...state.exams, data.exam] }));
    } catch (error) {
      console.error('Failed to create exam:', error);
    }
  },
  simulateMarksUpload: async (examId, marksData) => {
    try {
      await api.post(`/exams/${examId}/marks`, { marksArray: marksData || [] });
      set((state) => ({
        exams: state.exams.map((exam) => (
          exam.id === examId ? { ...exam, status: 'Completed' } : exam
        ))
      }));
    } catch (error) {
      console.error('Failed to upload marks:', error);
    }
  }
}));
