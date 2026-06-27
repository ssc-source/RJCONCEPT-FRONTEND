import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import { addCartItem } from '../../services/cartClient';
import { formatCurrency } from '../../utils/format';
import SeriesRankingPreview from '../../components/testseries/SeriesRankingPreview';

export default function TestSeriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    api.get('/test-series', { params: { isActive: true } })
      .then((response) => setItems(response.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const quickAdd = async (series) => {
    setAddingId(series.id);
    setStatus('');
    try {
      await addCartItem({
        itemType: 'TEST_SERIES',
        testSeriesId: series.id,
        name: series.title,
        price: Number(series.price || 0),
        quantity: 1,
      });
      setStatus(`${series.title} added to cart.`);
    } catch (error) {
      setStatus(error.message || 'Unable to add test series to cart.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">Test Series</h1>
        <p className="mt-3 text-lg text-slate-600">Mock exams, sectional tests, and paid practice bundles for both internal and external aspirants.</p>
        {status ? <p className="mt-4 text-sm font-semibold text-blue-600">{status}</p> : null}
      </div>

      {loading ? <p className="text-center text-slate-500">Loading test series...</p> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((series) => (
          <div key={series.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{series.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{series.course?.title || 'Multi-course practice'}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {series.tests?.length || 0} tests
              </span>
            </div>
            <p className="min-h-[72px] text-sm leading-6 text-slate-600">{series.description || 'Structured question banks with timed evaluation and ranking.'}</p>
            <p className="mt-3 text-sm font-medium text-blue-600">See how many students have already attempted this series.</p>
            <SeriesRankingPreview seriesId={series.id} />
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Starting price</p>
                <p className="text-2xl font-extrabold text-emerald-600">{Number(series.price) > 0 ? formatCurrency(series.price) : 'Free'}</p>
              </div>
              <div className="flex flex-col gap-2">
                {Number(series.price || 0) > 0 ? (
                  <button
                    type="button"
                    disabled={addingId === series.id}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    onClick={() => quickAdd(series)}
                  >
                    {addingId === series.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                ) : null}
                <Link href={`/test-series/${series.id}`} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                  Explore Series
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
