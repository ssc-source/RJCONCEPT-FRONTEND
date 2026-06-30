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
import Seo from '../../components/Seo';
import { getBreadcrumbSchema, getProductSchema } from '../../utils/seoSchemas';

export default function TestSeriesDetailPage({ initialSeries }) {
  const router = useRouter();
  const { id } = router.query;
  const [series, setSeries] = useState(initialSeries || null);
  const [participant, setParticipant] = useState({ name: '', email: '', phone: '' });
  const [user, setUser] = useState(null);
  const [seriesAttempts, setSeriesAttempts] = useState([]);
  const [hasSeriesAccess, setHasSeriesAccess] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [status, setStatus] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (initialSeries) return;
    if (!id) return;
    api.get(`/test-series/${id}`)
      .then((response) => setSeries(response.data))
      .catch(() => {});
  }, [id, initialSeries]);

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

  const seoSchema = useMemo(() => {
    if (!series) return null;
    return [
      getBreadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Test Series', item: '/test-series' },
        { name: series.title, item: `/test-series/${series.id}` }
      ]),
      getProductSchema({
        id: series.id,
        name: series.title,
        description: series.description,
        price: series.price,
        imageUrl: '/logo_rj.png'
      })
    ];
  }, [series]);

  if (!series) {
    return (
      <>
        <Seo title="Loading Test Series" noindex={true} />
        <div className="container mx-auto px-4 py-16 text-center text-slate-500">Loading test series...</div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={series.title}
        description={series.description || 'Practice with premium online test series at RJ Concept.'}
        schema={seoSchema}
      />

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
                                if (resultPath) router.push(resultPath);
                              }}
                              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              View Result
                            </button>
                            {rankingPath ? (
                              <Link
                                href={rankingPath}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                View Leaderboard
                              </Link>
                            ) : null}
                          </>
                        ) : null}
                        <button
                          type="button"
                          disabled={requiresPurchase && !hasSeriesAccess}
                          onClick={() => startTest(test.id)}
                          className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition ${requiresPurchase && !hasSeriesAccess ? 'cursor-not-allowed bg-slate-300' : 'bg-slate-900 hover:bg-slate-800'}`}
                        >
                          {seriesAccessAvailable ? (hasAttempted ? 'Re-attempt Test' : 'Start Test') : 'Enroll to Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {showParticipantForm ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">Registration details</h2>
                <p className="mt-2 text-sm text-slate-500">Provide name and email to proceed with enrollment.</p>
                <div className="mt-4 grid gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={participant.name}
                    onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={participant.email}
                    onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={participant.phone}
                    onChange={(e) => setParticipant({ ...participant, phone: e.target.value })}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Buy Full Series</h3>
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

            {seriesAttempts.length > 0 ? (
              <div className="space-y-6">
                <AttemptHistory attempts={seriesAttempts} />
                <SeriesRanking seriesId={id} />
              </div>
            ) : null}
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
    const res = await fetch(`${apiBase.replace(/\/+$/, '')}/test-series/${id}`);
    if (res.ok) {
      const result = await res.json();
      const series = result?.data || result || null;
      return {
        props: {
          initialSeries: series,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching test-series for SSR:', error.message);
  }
  
  return {
    props: {
      initialSeries: null,
    },
  };
}
