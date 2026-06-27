import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import { pushToast } from '../stores/toastStore';
import { buildTestResultPath, buildTestSeriesTestsPath } from '../utils/testRoutes';

export default function TestAttempt() {
  const router = useRouter();
  const { testId, seriesId } = router.query;
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptStartedAt, setAttemptStartedAt] = useState(null);

  const goToSeriesTests = (fallbackSeriesId) => {
    const testsPath = buildTestSeriesTestsPath(fallbackSeriesId || seriesId || test?.seriesId || test?.testSeriesId || null);
    if (testsPath) {
      router.push(testsPath);
      return;
    }

    router.push('/test-series');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedParticipant = sessionStorage.getItem('testParticipant');
    if (savedParticipant) {
      setParticipant(JSON.parse(savedParticipant));
    }
  }, []);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      setLoadError('No test selected. Please choose a test from the series page.');
      return;
    }

    setLoading(true);
    setLoadError(null);

    api.get(`/tests/${testId}`, { meta: { scope: 'public' } })
      .then((response) => {
        setTest(response.data);
        setTimeLeft(Number(response.data.duration || 0) * 60);
      })
      .catch((error) => {
        setLoadError(error?.message || 'Unable to load test details.');
      })
      .finally(() => setLoading(false));
  }, [testId]);

  useEffect(() => {
    if (!testId || typeof window === 'undefined') return;

    const storageKey = `testStartedAt:${testId}`;
    const existingStartedAt = sessionStorage.getItem(storageKey);
    if (existingStartedAt) {
      setAttemptStartedAt(existingStartedAt);
      return;
    }

    const nowIso = new Date().toISOString();
    sessionStorage.setItem(storageKey, nowIso);
    setAttemptStartedAt(nowIso);
  }, [testId]);

  useEffect(() => {
    if (!test || timeLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test, timeLeft]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await api.post('/test-attempts/submit', {
        testId,
        answers,
        participant,
        startedAt: attemptStartedAt,
      });
      const attemptId = response?.data?.attempt?.id;
      const resultPath = buildTestResultPath(attemptId);

      if (!resultPath) {
        throw new Error('Attempt completed, but the result route could not be generated.');
      }

      if (typeof window !== 'undefined' && testId) {
        sessionStorage.removeItem(`testStartedAt:${testId}`);
      }

      router.push(resultPath);
    } catch (error) {
      pushToast({
        title: 'Submission failed',
        description: error?.message || 'Unable to submit test.',
        type: 'error',
      });
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && test && !loadError) {
      submit();
    }
  }, [timeLeft, test, loadError]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-500">Preparing test environment...</div>;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-500">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Unable to load test</h1>
          <p className="mt-4 text-sm text-slate-600">{loadError}</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => router.push(seriesId ? `/test-series/${seriesId}` : '/test-series')}
            >
              Browse Series
            </button>
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() => goToSeriesTests()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test || !participant) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 text-center text-slate-500">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Participant information missing</h1>
          <p className="mt-4 text-sm text-slate-600">We could not find participant details for this attempt. Please go back to the series page and start the test again.</p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() => goToSeriesTests()}
            >
              Return to Series
            </button>
          </div>
        </div>
      </div>
    );
  }

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{test.title}</h1>
            <p className="text-sm text-slate-500">{participant.name} • {participant.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`rounded-xl px-4 py-2 text-lg font-bold ${timeLeft < 300 ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
              {minutes}:{seconds}
            </div>
            <button type="button" className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white" onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {(test.questions || []).map((question, index) => (
          <div key={question.id} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Q{index + 1}. {question.questionText}</h2>
            <div className="mt-4 space-y-3">
              {['A', 'B', 'C', 'D'].map((key) => (
                <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${answers[question.id] === key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <input
                    type="radio"
                    name={String(question.id)}
                    value={key}
                    checked={answers[question.id] === key}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: key }))}
                  />
                  <span>{question[`option${key}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
