import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../services/api';
import { pushToast } from '../../../stores/toastStore';
import { getPublicToken } from '../../../utils/auth';
import { buildTestAttemptPath, buildTestRankingPath, buildTestResultPath } from '../../../utils/testRoutes';

export default function TestSeriesTestsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [series, setSeries] = useState(null);
  const [testAttempts, setTestAttempts] = useState([]);
  const [hasSeriesAccess, setHasSeriesAccess] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const token = getPublicToken();
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Fetch series, user, access, and attempts using explicit public auth scope
    Promise.allSettled([
      api.get(`/test-series/${id}/tests`, { meta: { scope: 'public' } }),
      api.get('/auth/me', { meta: { scope: 'public' } }),
      api.get('/test-enrollments/my', { params: { testSeriesId: id }, meta: { scope: 'public' } }),
      api.get(`/test-attempts/series/${id}/history`, { meta: { scope: 'public' } }),
    ]).then(([seriesRes, userRes, enrollmentsRes, attemptsRes]) => {
      if (seriesRes.status === 'fulfilled') setSeries(seriesRes.value.data);
      if (userRes.status === 'fulfilled') setUser(userRes.value.user);
      if (enrollmentsRes.status === 'fulfilled') setHasSeriesAccess((enrollmentsRes.value.data || []).length > 0);
      if (attemptsRes.status === 'fulfilled') setTestAttempts(attemptsRes.value.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id, router]);

  const testAttemptsMap = useMemo(() => {
    const map = {};
    testAttempts.forEach(attempt => {
      if (!map[attempt.testId]) map[attempt.testId] = [];
      map[attempt.testId].push(attempt);
    });
    return map;
  }, [testAttempts]);

  const startTest = (testId) => {
    if (!id) {
      pushToast({
        title: 'Missing series details',
        description: 'Unable to start a test without a valid series id.',
        type: 'error',
      });
      return;
    }

    if (!hasSeriesAccess && Number(series?.price || 0) > 0) {
      pushToast({
        title: 'Access required',
        description: 'Please purchase this test series first.',
        type: 'warning',
      });
      return;
    }

    const testParticipant = user ? {
      name: user.name || '',
      email: user.email || '',
      phone: '',
    } : { name: '', email: '', phone: '' };

    sessionStorage.setItem('testParticipant', JSON.stringify(testParticipant));
    const attemptPath = buildTestAttemptPath({ testId, seriesId: id });
    if (!attemptPath) {
      pushToast({
        title: 'Missing test details',
        description: 'Unable to start the selected test because the route is incomplete.',
        type: 'error',
      });
      return;
    }

    router.push(attemptPath);
  };

  const getLatestAttempt = (testId) => {
    const attempts = testAttemptsMap[testId] || [];
    return attempts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-500">
        Loading test series...
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-500">
        Test series not found.
      </div>
    );
  }

  if (!hasSeriesAccess && Number(series.price || 0) > 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-sm max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Required</h1>
          <p className="text-slate-600 mb-6">You need to purchase this test series to access the tests.</p>
          <Link href={`/test-series/${id}`} className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold">
            View Series Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <Link href={`/dashboard/student`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">{series.title}</h1>
          <p className="text-slate-600 mt-2">{series.description}</p>
        </div>

        <div className="space-y-6">
          {series.tests?.map((test, index) => {
            const latestAttempt = getLatestAttempt(test.id);
            const hasAttempted = !!latestAttempt;
            const rankingPath = buildTestRankingPath({ testId: test.id, seriesId: id });

            return (
              <div key={test.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {index + 1}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">Questions:</span> {test.questions?.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {test.duration} min
                      </div>
                      <div>
                        <span className="font-medium">Marks:</span> {test.totalMarks || 0}
                      </div>
                      <div>
                        <span className="font-medium">Passing:</span> {test.passingMarks || 0}
                      </div>
                    </div>
                    {hasAttempted && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            Last attempt: {new Date(latestAttempt.submittedAt).toLocaleDateString()}
                          </span>
                          <span className={`font-semibold ${latestAttempt.score >= (test.passingMarks || 0) ? 'text-green-600' : 'text-red-600'}`}>
                            Score: {latestAttempt.score}/{test.totalMarks || latestAttempt.test?.totalMarks || latestAttempt.totalQuestions}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {hasAttempted ? (
                      <>
                        {buildTestResultPath(latestAttempt.id) ? (
                          <Link
                            href={buildTestResultPath(latestAttempt.id)}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View Result
                          </Link>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400">
                            Result Unavailable
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => startTest(test.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Re-attempt
                        </button>
                        {rankingPath ? (
                          <Link
                            href={rankingPath}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Rank
                          </Link>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startTest(test.id)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Start Test
                        </button>
                        {rankingPath ? (
                          <Link
                            href={rankingPath}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Rank
                          </Link>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(!series.tests || series.tests.length === 0) && (
          <div className="text-center py-12">
            <p className="text-slate-500">No tests available in this series.</p>
          </div>
        )}
      </div>
    </div>
  );
}