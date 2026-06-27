import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../../components/Layout';
import api from '../../../../services/api';
import { buildTestAttemptPath, buildTestResultPath } from '../../../../utils/testRoutes';

export default function StudentSeriesProfilePage() {
  const router = useRouter();
  const { id, studentId } = router.query;
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !studentId) return;

    setLoading(true);
    setError(null);

    api
      .get(`/test-attempts/series/${id}/student/${studentId}/history`, {
        meta: { scope: 'admin' },
      })
      .then((response) => {
        setAttempts(response.data || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Unable to load student attempts');
      })
      .finally(() => setLoading(false));
  }, [id, studentId]);

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Attempts</h1>
            <p className="mt-2 text-sm text-slate-500">Review the attempt history for this student in the selected series.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <Link href={`/test-series/${id}`} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Series Details
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading student attempts...</div>
        ) : error ? (
          <div className="rounded-3xl border border-slate-200 bg-rose-50 p-10 text-center text-rose-700">{error}</div>
        ) : attempts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">No attempts found for this student in the selected series.</div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{attempt.test?.title || 'Untitled Test'}</h2>
                    <p className="mt-1 text-sm text-slate-500">Attempted on {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}</p>
                    <p className="mt-2 text-sm text-slate-600">Score: {attempt.score}/{attempt.totalQuestions || attempt.test?.totalMarks || 0} ({attempt.percentage?.toFixed(1)}%)</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {buildTestResultPath(attempt.id) ? (
                      <Link
                        href={buildTestResultPath(attempt.id)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Result
                      </Link>
                    ) : null}
                    {buildTestAttemptPath({ testId: attempt.testId || attempt.test?.id, seriesId: id }) ? (
                      <Link
                        href={buildTestAttemptPath({ testId: attempt.testId || attempt.test?.id, seriesId: id })}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Re-attempt
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}