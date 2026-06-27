import { create } from 'zustand';
import { AUTH_CHANGED_EVENT } from '../utils/auth';

export const CART_CHANGED_EVENT = 'rj-cart-changed';

const computeCount = (items = []) => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

export const useCartStore = create((set) => ({
  items: [],
  count: 0,
  hydrate: (items = []) => set({ items, count: computeCount(items) }),
  clear: () => set({ items: [], count: 0 }),
}));

export const broadcastCartChange = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
};

if (typeof window !== 'undefined') {
  window.addEventListener(AUTH_CHANGED_EVENT, (event) => {
    if (event.detail?.scope === 'public') {
      useCartStore.getState().clear();
    }
  });
}
