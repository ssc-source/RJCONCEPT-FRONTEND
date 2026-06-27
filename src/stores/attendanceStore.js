import { create } from 'zustand';
import api from './authStore';

export const useAttendanceStore = create((set, get) => ({
  attendanceList: [],
  isLoading: false,
  fetchBatchAttendance: async (batchId, date) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/attendance?batchId=${batchId}&date=${date}`);
      set({ attendanceList: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
  updateLocalStatus: (studentId, status) => {
    set((state) => ({
      attendanceList: state.attendanceList.map(item =>
        item.studentId === studentId ? { ...item, status } : item
      )
    }));
  },
  saveAttendance: async (batchId, date, records) => {
    try {
      const studentStatusArray = records || get().attendanceList.map((item) => ({
        studentId: item.studentId,
        status: item.status
      }));
      await api.post('/attendance', { batchId, date, studentStatusArray });
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  }
}));
