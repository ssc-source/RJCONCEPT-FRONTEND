import api from './api';
import { broadcastCartChange, useCartStore } from '../stores/cartStore';
import { getPublicToken } from '../utils/auth';

const getLocalCart = () => JSON.parse(localStorage.getItem('cart') || '[]');

const setLocalCart = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
  useCartStore.getState().hydrate(items);
  broadcastCartChange();
};

const hasToken = () => typeof window !== 'undefined' && Boolean(getPublicToken());

export const getCart = async () => {
  if (!hasToken()) {
    const cart = getLocalCart();
    useCartStore.getState().hydrate(cart);
    return cart;
  }

  const localCart = getLocalCart();
  if (localCart.length > 0) {
    const response = await api.post('/cart/sync', {
      items: localCart.map((item) => ({
        itemType: item.itemType,
        productId: item.productId || null,
        testSeriesId: item.testSeriesId || null,
        quantity: item.quantity || 1,
      })),
    }, { meta: { scope: 'public' } });
    setLocalCart([]);
    useCartStore.getState().hydrate(response.data || []);
    broadcastCartChange();
    return response.data || [];
  }

  const response = await api.get('/cart', { meta: { scope: 'public' } });
  useCartStore.getState().hydrate(response.data || []);
  return response.data || [];
};

export const addCartItem = async (payload) => {
  const normalizedPayload = {
    itemType: payload.itemType,
    productId: payload.productId || null,
    testSeriesId: payload.testSeriesId || null,
    quantity: payload.itemType === 'TEST_SERIES' ? 1 : Math.max(1, Number(payload.quantity || 1)),
  };

  if (!hasToken()) {
    const cart = getLocalCart();
    const existing = cart.find((item) => (
      item.itemType === payload.itemType &&
      item.productId === payload.productId &&
      item.testSeriesId === payload.testSeriesId
    ));

    if (existing) {
      existing.quantity += normalizedPayload.quantity;
    } else {
      cart.push(payload);
    }
    setLocalCart(cart);
    return cart;
  }

  const response = await api.post('/cart/add', normalizedPayload, { meta: { scope: 'public' } });
  const cart = await api.get('/cart', { meta: { scope: 'public' } });
  useCartStore.getState().hydrate(cart.data || []);
  broadcastCartChange();
  return response.data;
};

export const updateCartItem = async (item, quantity) => {
  if (!hasToken()) {
    const cart = getLocalCart()
      .map((cartItem) => (
        cartItem.itemType === item.itemType &&
        cartItem.productId === item.productId &&
        cartItem.testSeriesId === item.testSeriesId
          ? { ...cartItem, quantity }
          : cartItem
      ))
      .filter((cartItem) => Number(cartItem.quantity || 0) > 0);
    setLocalCart(cart);
    return cart;
  }

  const response = await api.put(`/cart/${item.id}`, { quantity }, { meta: { scope: 'public' } });
  useCartStore.getState().hydrate(response.data || []);
  broadcastCartChange();
  return response.data || [];
};

export const removeCartItem = async (item) => {
  if (!hasToken()) {
    const cart = getLocalCart().filter((cartItem) => !(
      cartItem.itemType === item.itemType &&
      cartItem.productId === item.productId &&
      cartItem.testSeriesId === item.testSeriesId
    ));
    setLocalCart(cart);
    return cart;
  }

  await api.delete(`/cart/${item.id}`, { meta: { scope: 'public' } });
  const refreshed = await api.get('/cart', { meta: { scope: 'public' } });
  useCartStore.getState().hydrate(refreshed.data || []);
  broadcastCartChange();
  return refreshed.data || [];
};

export const clearCart = async () => {
  setLocalCart([]);
  if (!hasToken()) return [];
  await api.delete('/cart', { meta: { scope: 'public' } });
  useCartStore.getState().clear();
  broadcastCartChange();
  return [];
};
