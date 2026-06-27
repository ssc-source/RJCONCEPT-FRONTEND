import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../utils/auth', () => ({
  getPublicToken: vi.fn(() => null),
}));

const broadcastCartChangeMock = vi.fn();
const hydrateMock = vi.fn();
const clearMock = vi.fn();

const createStorageMock = () => {
  let storage = {};
  return {
    clear: () => {
      storage = {};
    },
    getItem: (key) => (key in storage ? storage[key] : null),
    setItem: (key, value) => {
      storage[key] = String(value);
    },
    removeItem: (key) => {
      delete storage[key];
    },
  };
};

vi.mock('../../stores/cartStore', () => ({
  broadcastCartChange: (...args) => broadcastCartChangeMock(...args),
  useCartStore: {
    getState: () => ({
      hydrate: hydrateMock,
      clear: clearMock,
    }),
  },
}));

describe('cartClient guest cart flow', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    });
    hydrateMock.mockClear();
    clearMock.mockClear();
    broadcastCartChangeMock.mockClear();
    vi.resetModules();
  });

  it('reads guest cart from localStorage and hydrates the store', async () => {
    window.localStorage.setItem('cart', JSON.stringify([{ itemType: 'PRODUCT', productId: 'p1', quantity: 2 }]));
    const { getCart } = await import('../cartClient');

    const result = await getCart();

    expect(result).toEqual([{ itemType: 'PRODUCT', productId: 'p1', quantity: 2 }]);
    expect(hydrateMock).toHaveBeenCalledWith([{ itemType: 'PRODUCT', productId: 'p1', quantity: 2 }]);
  });

  it('adds a guest cart item locally and broadcasts the change', async () => {
    const { addCartItem } = await import('../cartClient');

    const result = await addCartItem({ itemType: 'TEST_SERIES', testSeriesId: 'ts1', quantity: 99 });

    expect(result).toEqual([{ itemType: 'TEST_SERIES', testSeriesId: 'ts1', quantity: 99 }]);
    expect(JSON.parse(window.localStorage.getItem('cart'))).toEqual([{ itemType: 'TEST_SERIES', testSeriesId: 'ts1', quantity: 99 }]);
    expect(broadcastCartChangeMock).toHaveBeenCalled();
  });

  it('clears the guest cart without requiring the API', async () => {
    window.localStorage.setItem('cart', JSON.stringify([{ itemType: 'PRODUCT', productId: 'p1', quantity: 1 }]));
    const { clearCart } = await import('../cartClient');

    const result = await clearCart();

    expect(result).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem('cart'))).toEqual([]);
    expect(clearMock).not.toHaveBeenCalled();
  });
});