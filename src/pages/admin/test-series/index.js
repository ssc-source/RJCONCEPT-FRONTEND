import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTestSeriesStore } from '../../../stores/testSeriesStore';
import { formatCurrency } from '../../../utils/format';

export default function TestSeriesAdminPage() {
  const { items, meta, isLoading, fetchTestSeries, deleteTestSeries } = useTestSeriesStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTestSeries().catch(() => {});
  }, [fetchTestSeries]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      [item.title, item.description, item.course?.title].filter(Boolean).some((value) => value.toLowerCase().includes(search.toLowerCase()))
    );
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Test Series Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create monetizable test bundles with nested tests, MCQs, and revenue-ready pricing.</p>
        </div>
        <Link href="/admin/test-series/create" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm">
          Create Test Series
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Series Catalog</h2>
            <p className="text-sm text-slate-500">{meta?.total || filtered.length} total test series</p>
          </div>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3 md:max-w-xs" placeholder="Search series..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Series</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tests</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Questions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="6">Loading test series...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="6">No test series found.</td></tr>}
              {filtered.map((series) => (
                <tr key={series.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{series.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{series.description || 'No description added yet.'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{series.course?.title || 'Standalone'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{series.tests?.length || 0}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {(series.tests || []).reduce((sum, test) => sum + (test.questions?.length || 0), 0)}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatCurrency(series.price)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/test-series/${series.id}`} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                        Manage
                      </Link>
                      <Link href={`/admin/test-series/${series.id}/rankings`} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">
                        Rankings
                      </Link>
                      <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteTestSeries(series.id).catch((error) => alert(error.message || 'Delete failed'))}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
