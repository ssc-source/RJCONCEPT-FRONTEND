import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import { addCartItem } from '../../services/cartClient';
import { formatCurrency } from '../../utils/format';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';
import Seo from '../../components/Seo';
import { getBreadcrumbSchema, getProductSchema } from '../../utils/seoSchemas';

export default function StorePage({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [status, setStatus] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    
    api.get('/products', { params: { type: 'BOOK', isActive: true } })
      .then((response) => setProducts(response.data || []))
      .catch(() => {});
  }, [initialProducts]);

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

  const seoSchema = useMemo(() => {
    const breadcrumb = getBreadcrumbSchema([
      { name: 'Home', item: '/' },
      { name: 'Store', item: '/store' }
    ]);
    const productList = products.map(p => getProductSchema(p)).filter(Boolean);
    return [breadcrumb, ...productList];
  }, [products]);

  return (
    <>
      <Seo
        title="Book Store"
        description="Purchase premium reference books, solved practice mock papers, exam guides, and official study modules curated by RJ Concept subject matter specialists."
        schema={seoSchema}
      />

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Book Store</h1>
          <p className="mt-3 text-lg text-slate-600">Printed books, practice material, and institute publications ready for online checkout.</p>
          {status ? <p className="mt-4 text-sm font-semibold text-blue-600">{status}</p> : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="mb-4 h-48 overflow-hidden rounded-2xl bg-slate-100">
                {product.imageUrl ? (
                  <img
                    src={resolveMediaUrl(product.imageUrl)}
                    onError={handleMediaError}
                    alt={product.name}
                    title={product.name}
                    width={300}
                    height={200}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">{product.description || 'No description available.'}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-2xl font-extrabold text-emerald-600">{formatCurrency(product.price)}</span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={addingId === product.id || Number(product.stock || 0) <= 0}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition"
                    onClick={() => quickAdd(product)}
                  >
                    {addingId === product.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <Link href={`/store/${product.id}`} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-slate-800 transition">
                    View Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.rjconcept.in/api';
  
  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, '')}/products?type=BOOK&isActive=true`);
    if (res.ok) {
      const result = await res.json();
      const products = result?.data || result || [];
      return {
        props: {
          initialProducts: Array.isArray(products) ? products : [],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching store products for SSR:', error.message);
  }
  
  return {
    props: {
      initialProducts: [],
    },
  };
}
