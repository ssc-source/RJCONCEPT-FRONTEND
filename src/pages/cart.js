import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatCurrency } from '../utils/format';
import { getCart, removeCartItem, updateCartItem } from '../services/cartClient';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getCart().then(setCart).catch(() => setCart([]));
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cart]
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  const removeItem = async (item) => {
    const updated = await removeCartItem(item);
    setCart(updated);
  };

  const changeQuantity = async (item, quantity) => {
    const updated = await updateCartItem(item, quantity);
    setCart(updated || []);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-extrabold text-slate-900">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg text-slate-600">Your cart is empty.</p>
          <Link href="/store" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            Explore Store
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={item.id || `${item.itemType}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.itemType === 'TEST_SERIES' ? 'Test Series' : 'Book'} | Qty {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-slate-200">
                      <button type="button" className="px-3 py-2 text-sm font-semibold text-slate-700" onClick={() => changeQuantity(item, Number(item.quantity || 0) - 1)}>
                        -
                      </button>
                      <span className="min-w-10 px-3 py-2 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                      <button type="button" className="px-3 py-2 text-sm font-semibold text-slate-700" onClick={() => changeQuantity(item, Number(item.quantity || 0) + 1)}>
                        +
                      </button>
                    </div>
                    <p className="font-semibold text-slate-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</p>
                    <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => removeItem(item)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="text-lg font-extrabold text-slate-900">{formatCurrency(total)}</span>
              </div>
            </div>
            <button type="button" className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white" onClick={() => router.push('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
