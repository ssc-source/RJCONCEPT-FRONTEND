import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../services/api';
import { getPublicToken } from '../../utils/auth';
import { buildTestSeriesTestsPath } from '../../utils/testRoutes';

export default function TestRankingPage() {
  const router = useRouter();
  const { testId, seriesId: seriesIdFromQuery } = router.query;
  const [test, setTest] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!testId) return;

    const token = getPublicToken();
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/tests/${testId}`, { meta: { scope: 'public' } }),
      api.get(`/tests/${testId}/ranking`, { meta: { scope: 'public' } }),
    ])
      .then(([testResponse, rankingResponse]) => {
        setTest(testResponse.data || null);
        setRankings(Array.isArray(rankingResponse.data) ? rankingResponse.data : []);
      })
      .catch((requestError) => {
        setError(requestError?.message || 'Unable to load test ranking.');
      })
      .finally(() => setLoading(false));
  }, [router, testId]);

  const seriesId = useMemo(
    () => test?.testSeriesId || test?.series?.id || seriesIdFromQuery || null,
    [seriesIdFromQuery, test]
  );
  const backPath = useMemo(() => buildTestSeriesTestsPath(seriesId) || '/test-series', [seriesId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-500">Loading test ranking...</div>;
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900">Test not found</h1>
          <p className="mt-4 text-sm text-slate-500">{error || 'The requested ranking page is unavailable.'}</p>
          <div className="mt-8">
            <Link href={backPath} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Test Ranking</p>
              <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{test.title}</h1>
              <p className="mt-2 text-sm text-slate-500">Ranking is based on marks, accuracy, and faster completion time.</p>
            </div>
            <Link href={backPath} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Back to Tests
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          {rankings.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No rankings available for this test yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 font-semibold text-slate-700">Rank</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Student Name</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Marks</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Accuracy</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Time Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((entry) => (
                    <tr key={`${entry.studentId}-${entry.rank}`} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">{entry.rank}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.studentName || 'Student'}</td>
                      <td className="px-4 py-3 text-slate-700">{entry.obtainedMarks}/{entry.totalMarks}</td>
                      <td className="px-4 py-3 text-slate-700">{Number(entry.accuracy || 0).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-slate-700">{entry.timeTaken || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}