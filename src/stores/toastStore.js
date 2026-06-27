import { create } from 'zustand';

const TOAST_DURATION = 3200;

export const useToastStore = create((set) => ({
  toasts: [],
  pushToast: ({ title, description = '', type = 'info', duration = TOAST_DURATION }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type }],
    }));

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }
  },
  dismissToast: (id) => set((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id),
  })),
}));

export const pushToast = (toast) => useToastStore.getState().pushToast(toast);
