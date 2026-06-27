import { create } from 'zustand';
import api from './authStore';

export const useLeadStore = create((set) => ({
  leads: [],
  isLoading: false,
  fetchLeads: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/leads');
      set({ leads: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
  updateLeadStatus: async (id, status) => {
    try {
      await api.put(`/leads/${id}/status`, { status });
      set((state) => ({
        leads: state.leads.map(l => l.id === id ? { ...l, status } : l)
      }));
    } catch (error) {
      console.error('Update lead status error:', error);
    }
  }
}));
