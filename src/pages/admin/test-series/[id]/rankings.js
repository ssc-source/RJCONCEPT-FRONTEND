import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../services/api';

const timeframeOptions = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const downloadCsv = (rows, seriesId, timeframe) => {
  const headers = ['Rank', 'Student Name', 'Obtained Marks', 'Total Series Marks', 'Accuracy', 'Attempt Count'];
  const csvRows = [headers.join(',')];

  rows.forEach((row) => {
    const values = [
      row.rank,
      row.studentName,
      row.obtainedMarks,
      row.totalSeriesMarks,
      `${row.accuracy.toFixed(1)}%`,
      row.attemptCount,
    ];
    csvRows.push(values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `series-${seriesId}-rankings-${timeframe}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function AdminSeriesRankingsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 100;

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    api
      .get(`/test-series/${id}/rankings`, {
        params: { limit, page, timeframe },
        meta: { scope: 'admin' },
      })
      .then((response) => {
        const data = response?.data || [];
        setRankings(Array.isArray(data) ? data : []);
        setHasMore(Array.isArray(data) ? data.length === limit : false);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load rankings');
        setLoading(false);
      });
  }, [id, page, timeframe]);

  const pagedStart = (page - 1) * limit + 1;
  const pagedEnd = pagedStart + rankings.length - 1;

  const memoizedCsvRows = useMemo(() => rankings, [rankings]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Rankboard</h1>
            <p className="mt-1 text-sm text-slate-500">View series leaderboard data and export rankings for offline analysis.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/test-series/${id}`} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Back to Series
            </Link>
            <button
              type="button"
              onClick={() => downloadCsv(memoizedCsvRows, id, timeframe)}
              disabled={rankings.length === 0}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label htmlFor="timeframe" className="text-sm font-medium text-slate-700">
            Timeframe:
          </label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => {
              setTimeframe(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {timeframeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading rankings...</div>
        ) : error ? (
          <div className="text-center py-10 text-rose-700">{error}</div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No rankings available for this timeframe.</div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">Showing {pagedStart}-{pagedEnd} of top {rankings.length} rows</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!hasMore}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 font-semibold text-slate-700">Rank</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Student</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Marks</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Accuracy</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((ranking) => (
                    <tr key={`${ranking.studentId}-${ranking.rank}`} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">{ranking.rank}</td>
                      <td className="px-4 py-3 text-slate-700">{ranking.studentName || 'Anonymous'}</td>
                      <td className="px-4 py-3 text-slate-700">{ranking.obtainedMarks}/{ranking.totalSeriesMarks}</td>
                      <td className={`px-4 py-3 font-semibold ${ranking.accuracy >= 70 ? 'text-green-600' : ranking.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{ranking.accuracy.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-slate-700">{ranking.attemptCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
