import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../services/api';
import { addCartItem } from '../../services/cartClient';
import { pushToast } from '../../stores/toastStore';
import { formatCurrency } from '../../utils/format';
import { getPublicToken } from '../../utils/auth';
import { buildTestAttemptPath, buildTestRankingPath, buildTestResultPath, buildTestSeriesTestsPath } from '../../utils/testRoutes';
import SeriesRanking from '../../components/testseries/SeriesRanking';
import AttemptHistory from '../../components/testseries/AttemptHistory';

export default function TestSeriesDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [series, setSeries] = useState(null);
  const [participant, setParticipant] = useState({ name: '', email: '', phone: '' });
  const [user, setUser] = useState(null);
  const [seriesAttempts, setSeriesAttempts] = useState([]);
  const [hasSeriesAccess, setHasSeriesAccess] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [status, setStatus] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/test-series/${id}`)
      .then((response) => setSeries(response.data))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    const token = getPublicToken();
    if (!token) return;

    api.get(`/test-attempts/series/${id}/history`, { meta: { scope: 'public' } })
      .then((response) => setSeriesAttempts(response.data || []))
      .catch(() => setSeriesAttempts([]));
  }, [id]);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    const token = getPublicToken();
    if (!token) {
      setUser(null);
      setHasSeriesAccess(false);
      setLoadingAccess(false);
      return;
    }

    setLoadingAccess(true);
    Promise.allSettled([
      api.get('/auth/me', { meta: { scope: 'public' } }),
      api.get('/test-enrollments/my', { params: { testSeriesId: id }, meta: { scope: 'public' } }),
    ])
      .then(([meRes, enrollRes]) => {
        if (meRes.status === 'fulfilled') {
          setUser(meRes.value.user || null);
        } else {
          setUser(null);
        }

        if (enrollRes.status === 'fulfilled') {
          setHasSeriesAccess((enrollRes.value.data || []).length > 0);
        } else {
          setHasSeriesAccess(false);
        }
      })
      .finally(() => setLoadingAccess(false));
  }, [id]);

  useEffect(() => {
    if (user && hasSeriesAccess) {
      setParticipant((current) => ({
        name: user.name || current.name,
        email: user.email || current.email,
        phone: user.phone || current.phone,
      }));
    }
  }, [user, hasSeriesAccess]);

  const totalQuestions = useMemo(
    () => (series?.tests || []).reduce((sum, test) => sum + (test.questions?.length || 0), 0),
    [series]
  );

  const requiresPurchase = Number(series?.price || 0) > 0;
  const seriesAccessAvailable = hasSeriesAccess || !requiresPurchase;
  const firstTestId = series?.tests?.[0]?.id;
  const showParticipantForm = !user || !hasSeriesAccess;

  const attemptsByTestId = seriesAttempts.reduce((acc, attempt) => {
    const testIdKey = attempt.testId || attempt.test?.id;
    if (!testIdKey) return acc;
    const existing = acc[testIdKey] || [];
    return {
      ...acc,
      [testIdKey]: [...existing, attempt].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    };
  }, {});

  const addToCart = async (redirectToCart = false) => {
    if (!series) return;
    setAdding(true);
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
      if (redirectToCart) {
        router.push('/cart');
      }
    } catch (error) {
      setStatus(error.message || 'Unable to add this series to cart.');
    } finally {
      setAdding(false);
    }
  };

  const startTest = (testId) => {
    if (!testId) {
      pushToast({
        title: 'No test selected',
        description: 'Please select a test to begin.',
        type: 'warning',
      });
      return;
    }

    const attemptPath = buildTestAttemptPath({ testId, seriesId: id });
    if (!attemptPath) {
      pushToast({
        title: 'Missing test details',
        description: 'Unable to start the test because the route information is incomplete.',
        type: 'error',
      });
      return;
    }

    const token = getPublicToken();
    if (requiresPurchase && !hasSeriesAccess) {
      if (!token) {
        pushToast({
          title: 'Sign in required',
          description: 'Please sign in to access purchased tests.',
          type: 'warning',
        });
        router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      pushToast({
        title: 'Purchase required',
        description: 'Please purchase this test series to start the tests.',
        type: 'warning',
      });
      return;
    }

    const participantPayload = user && hasSeriesAccess
      ? { name: user.name || '', email: user.email || '', phone: user.phone || '' }
      : participant;

    if (!participantPayload.name || !participantPayload.email || (!participantPayload.phone && requiresPurchase)) {
      pushToast({
        title: 'Participant details missing',
        description: 'Please complete registration details before starting the test.',
        type: 'warning',
      });
      return;
    }

    sessionStorage.setItem('testParticipant', JSON.stringify(participantPayload));
    router.push(attemptPath);
  };

  if (!series) {
    return <div className="container mx-auto px-4 py-16 text-center text-slate-500">Loading test series...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-extrabold text-slate-900">{series.title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{series.description || 'Timed mocks with auto evaluation, rankings, and practice feedback.'}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tests</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{series.tests?.length || 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Questions</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Price</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600">{Number(series.price) > 0 ? formatCurrency(series.price) : 'Free'}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Ready to begin?</p>
              <p className="mt-2 text-sm text-slate-500">Start the first test directly, or browse the full test list for this series.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={!firstTestId || (requiresPurchase && !hasSeriesAccess)}
                className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${!firstTestId || (requiresPurchase && !hasSeriesAccess) ? 'cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => startTest(firstTestId)}
              >
                {seriesAccessAvailable ? 'Start First Test' : 'Unlock First Test'}
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  const testsPath = buildTestSeriesTestsPath(id);
                  if (!testsPath) {
                    pushToast({
                      title: 'Missing series details',
                      description: 'Unable to open the test list without a valid series id.',
                      type: 'error',
                    });
                    return;
                  }
                  router.push(testsPath);
                }}
              >
                View Tests Page
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {series.tests?.map((test) => {
              const latestAttempt = attemptsByTestId[test.id]?.[0];
              const hasAttempted = Boolean(latestAttempt);
              const rankingPath = buildTestRankingPath({ testId: test.id, seriesId: id });
              return (
                <div key={test.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">{test.questions?.length || 0} questions | {test.duration} minutes | {test.totalMarks || 0} marks</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {hasAttempted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const resultPath = buildTestResultPath(latestAttempt.id);
                              if (!resultPath) {
                                pushToast({
                                  title: 'Missing attempt details',
                                  description: 'Unable to open the result page for this attempt.',
                                  type: 'error',
                                });
                                return;
                              }
                              router.push(resultPath);
                            }}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View Result
                          </button>
                          <button
                            type="button"
                            onClick={() => startTest(test.id)}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Re-attempt
                          </button>
                          {rankingPath ? (
                            <button
                              type="button"
                              onClick={() => router.push(rankingPath)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Rank
                            </button>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={requiresPurchase && !hasSeriesAccess}
                            className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${requiresPurchase && !hasSeriesAccess ? 'cursor-not-allowed bg-slate-300' : 'bg-slate-900 hover:bg-slate-800'}`}
                            onClick={() => startTest(test.id)}
                          >
                            {seriesAccessAvailable ? 'Start Test' : 'Purchase Required'}
                          </button>
                          {rankingPath ? (
                            <button
                              type="button"
                              onClick={() => router.push(rankingPath)}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Rank
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                  {hasAttempted && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span>Last Attempt: {new Date(latestAttempt.submittedAt).toLocaleDateString()}</span>
                        <span className={`font-semibold ${latestAttempt.percentage >= 70 ? 'text-green-600' : latestAttempt.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {latestAttempt.score}/{latestAttempt.test?.totalMarks || latestAttempt.totalQuestions} • {latestAttempt.percentage?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <SeriesRanking seriesId={id} />
          </div>

          {hasSeriesAccess && (
            <div className="mt-8">
              <AttemptHistory seriesId={id} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Test Access Details</h2>
            <p className="mt-2 text-sm text-slate-500">This panel shows your access status and allows you to start the first available test.</p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {loadingAccess ? (
                'Checking your access state...'
              ) : seriesAccessAvailable ? (
                hasSeriesAccess ? 'You have purchased access to this series, and your profile details will be used for the attempt.' : 'This series is free to access. Enter participant details to begin.'
              ) : (
                'This series requires purchase before you can start tests. Use the Buy Full Series panel below.'
              )}
            </div>

            {user && hasSeriesAccess ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                Logged in as {user.name || 'Student'} ({user.email})
              </div>
            ) : null}

            {showParticipantForm && (
              <div className="mt-4 space-y-4">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Full name"
                  value={participant.name}
                  onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Email"
                  value={participant.email}
                  onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Phone"
                  value={participant.phone}
                  onChange={(e) => setParticipant({ ...participant, phone: e.target.value })}
                />
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                disabled={!firstTestId || (requiresPurchase && !hasSeriesAccess)}
                className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white ${!firstTestId || (requiresPurchase && !hasSeriesAccess) ? 'cursor-not-allowed bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => startTest(firstTestId)}
              >
                {seriesAccessAvailable ? 'Start First Test' : 'Unlock First Test'}
              </button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  const testsPath = buildTestSeriesTestsPath(id);
                  if (!testsPath) {
                    pushToast({
                      title: 'Missing series details',
                      description: 'Unable to open the test list without a valid series id.',
                      type: 'error',
                    });
                    return;
                  }
                  router.push(testsPath);
                }}
              >
                Browse All Tests
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Buy Full Series</h2>
            <p className="mt-2 text-sm text-slate-500">Add the entire bundle to cart and complete checkout online.</p>
            <div className="mt-4 grid gap-3">
              <button type="button" className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={Number(series.price || 0) <= 0 || adding} onClick={() => addToCart(false)}>
                {adding ? 'Adding...' : Number(series.price || 0) > 0 ? `Add Series | ${formatCurrency(series.price)}` : 'This series is free'}
              </button>
              {Number(series.price || 0) > 0 ? (
                <button type="button" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700" disabled={adding} onClick={() => addToCart(true)}>
                  Buy Now
                </button>
              ) : null}
            </div>
            {status ? <p className="mt-4 text-sm font-semibold text-blue-600">{status}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
