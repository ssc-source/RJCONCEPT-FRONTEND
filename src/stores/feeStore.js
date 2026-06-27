import { create } from 'zustand';
import api from '../services/api';

export const useFeeStore = create((set) => ({
  fees: [],
  isLoading: false,
  fetchFees: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/fees', { meta: { scope: 'admin' } });
      set({ fees: response?.data || [], isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },
  collectPayment: async (feeId, payload) => {
    try {
      await api.put(`/fees/${feeId}`, { amountPaid: Number(payload) }, { meta: { scope: 'admin' } });
      // Re-fetch or update local state after payment collection
      const response = await api.get('/fees', { meta: { scope: 'admin' } });
      set({ fees: response?.data || [] });
    } catch (error) {
      console.error('Payment collection error:', error);
    }
  }
}));
