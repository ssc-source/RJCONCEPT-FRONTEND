import { useEffect, useState } from 'react';
import api from '../../services/api';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';

const PAGE_SIZE = 8;

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    api.get('/gallery/public', { params: { page: 1, limit: PAGE_SIZE } })
      .then((response) => {
        setItems(response.data || []);
        setMeta(response.meta || null);
      })
      .catch(() => {
        setItems([]);
        setMeta(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loadMore = async () => {
    if (!meta?.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = Number(meta?.page || 1) + 1;
      const response = await api.get('/gallery/public', { params: { page: nextPage, limit: PAGE_SIZE } });
      setItems((current) => [...current, ...(response.data || [])]);
      setMeta(response.meta || meta);
    } catch (error) {
      alert(error.message || 'Unable to load more gallery items');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-6xl">Gallery</span>
          <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Our Campus & Infrastructure</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Explore the RJ Concept environment through images that are fully managed from the admin panel.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
            Loading gallery...
          </div>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 shadow-sm">
            Gallery images will appear here soon.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-md transition hover:-translate-y-1">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                {item.imageUrl ? (
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    onError={handleMediaError}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover rounded-xl transition duration-500 group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="px-2 pb-2 pt-4 text-center">
                <p className="font-semibold text-gray-700">{item.title}</p>
                {item.description ? <p className="mt-2 text-sm text-gray-500">{item.description}</p> : null}
                {item.category ? <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.category}</span> : null}
              </div>
            </div>
          ))}
        </div>

        {!isLoading && meta?.hasMore ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              onClick={loadMore}
            >
              {isLoadingMore ? 'Loading...' : 'See More'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
