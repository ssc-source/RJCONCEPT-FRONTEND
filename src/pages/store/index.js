import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import { addCartItem } from '../../services/cartClient';
import { formatCurrency } from '../../utils/format';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    api.get('/products', { params: { type: 'BOOK', isActive: true } })
      .then((response) => setProducts(response.data || []))
      .catch(() => {});
  }, []);

  const quickAdd = async (product) => {
    setAddingId(product.id);
    setStatus('');
    try {
      await addCartItem({
        itemType: 'PRODUCT',
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
        quantity: 1,
        imageUrl: resolveMediaUrl(product.imageUrl),
      });
      setStatus(`${product.name} added to cart.`);
    } catch (error) {
      setStatus(error.message || 'Unable to add item to cart.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">Book Store</h1>
        <p className="mt-3 text-lg text-slate-600">Printed books, practice material, and institute publications ready for online checkout.</p>
        {status ? <p className="mt-4 text-sm font-semibold text-blue-600">{status}</p> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 h-48 overflow-hidden rounded-2xl bg-slate-100">
              {product.imageUrl ? <img src={resolveMediaUrl(product.imageUrl)} onError={handleMediaError} alt={product.name} className="h-full w-full object-cover" /> : null}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
            <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{product.description || 'No description available.'}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-2xl font-extrabold text-emerald-600">{formatCurrency(product.price)}</span>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={addingId === product.id || Number(product.stock || 0) <= 0}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  onClick={() => quickAdd(product)}
                >
                  {addingId === product.id ? 'Adding...' : 'Add to Cart'}
                </button>
                <Link href={`/store/${product.id}`} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                  View Book
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
