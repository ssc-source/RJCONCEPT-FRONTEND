import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import api from '../../services/api';
import { addCartItem } from '../../services/cartClient';
import { formatCurrency } from '../../utils/format';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';
import Seo from '../../components/Seo';
import { getProductSchema, getBreadcrumbSchema } from '../../utils/seoSchemas';

export default function ProductDetailPage({ initialProduct }) {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(initialProduct ? {
    ...initialProduct,
    imageUrl: resolveMediaUrl(initialProduct.imageUrl),
  } : null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (initialProduct) return;
    if (!id) return;
    api.get(`/products/${id}`).then((response) => {
      setProduct({
        ...response.data,
        imageUrl: resolveMediaUrl(response.data?.imageUrl),
      });
    }).catch(() => {});
  }, [id, initialProduct]);

  const addToCart = async (redirectToCart = false) => {
    if (!product) return;
    setAdding(true);
    setStatus('');
    try {
      await addCartItem({
        itemType: 'PRODUCT',
        productId: product.id,
        name: product.name,
        price: Number(product.price || 0),
        quantity,
        imageUrl: product.imageUrl,
      });
      setStatus(`${product.name} added to cart.`);
      if (redirectToCart) {
        router.push('/cart');
      }
    } catch (error) {
      setStatus(error.message || 'Unable to add this item to cart.');
    } finally {
      setAdding(false);
    }
  };

  const seoSchema = useMemo(() => {
    if (!product) return null;
    return [
      getBreadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Store', item: '/store' },
        { name: product.name, item: `/store/${product.id}` }
      ]),
      getProductSchema(product)
    ];
  }, [product]);

  if (!product) {
    return (
      <>
        <Seo title="Loading Product" noindex={true} />
        <div className="container mx-auto px-4 py-16 text-center text-slate-500">Loading product...</div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={product.name}
        description={product.description}
        image={product.imageUrl}
        schema={seoSchema}
      />

      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            {product.imageUrl ? (
              <img
                src={resolveMediaUrl(product.imageUrl)}
                onError={handleMediaError}
                alt={product.name}
                title={product.name}
                width={500}
                height={500}
                loading="lazy"
                className="h-full w-full object-cover animate-fade-in"
              />
            ) : null}
          </div>
          <div>
            <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{product.category}</p>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-900">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{product.description || 'No description available.'}</p>
            <p className="mt-6 text-4xl font-extrabold text-emerald-600">{formatCurrency(product.price)}</p>
            <p className="mt-2 text-sm text-slate-500">Stock available: {product.stock}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200">
                <button type="button" className="px-4 py-3 text-sm font-semibold text-slate-700" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                  -
                </button>
                <span className="min-w-12 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                <button type="button" className="px-4 py-3 text-sm font-semibold text-slate-700" onClick={() => setQuantity((current) => Math.min(Number(product.stock || current + 1), current + 1))}>
                  +
                </button>
              </div>
              <button type="button" disabled={adding || Number(product.stock || 0) <= 0} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" onClick={() => addToCart(false)}>
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button type="button" disabled={adding || Number(product.stock || 0) <= 0} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" onClick={() => addToCart(true)}>
                Buy Now
              </button>
            </div>
            {status ? <p className="mt-4 text-sm font-semibold text-blue-600">{status}</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.rjconcept.in/api';
  
  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, '')}/products/${id}`);
    if (res.ok) {
      const result = await res.json();
      // Since result structure usually returns { data: product } or { ...product }
      // We handle both structures gracefully.
      const product = result?.data || result || null;
      return {
        props: {
          initialProduct: product,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching product for SSR:', error.message);
  }
  
  return {
    props: {
      initialProduct: null,
    },
  };
}
