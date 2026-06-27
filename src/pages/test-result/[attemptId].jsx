import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../../services/api';
import { getAdminToken, getPublicToken } from '../../utils/auth';
import { buildTestAttemptPath, buildTestSeriesTestsPath, resolveSeriesId } from '../../utils/testRoutes';

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const formatTimeTaken = (result) => {
  if (result?.formattedTimeTaken) {
    return result.formattedTimeTaken;
  }

  if (typeof result?.timeTakenMs === 'number') {
    const minutes = Math.floor(result.timeTakenMs / 60000);
    const seconds = Math.floor((result.timeTakenMs % 60000) / 1000);
    return `${minutes} min ${seconds} sec`;
  }

  return 'N/A';
};

const getAuthScope = () => {
  if (typeof window === 'undefined') {
    return 'public';
  }

  return getAdminToken() ? 'admin' : 'public';
};

const StatCard = ({ label, value, tone = 'slate', helper }) => {
  const toneClasses = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    slate: 'border-slate-200 bg-white text-slate-900',
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${toneClasses[tone] || toneClasses.slate}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
      {helper ? <p className="mt-2 text-sm opacity-80">{helper}</p> : null}
    </div>
  );
};

export default function TestResultAnalysisPage() {
  const router = useRouter();
  const { attemptId } = router.query;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showSolutions, setShowSolutions] = useState(false);
  const scope = getAuthScope();

  useEffect(() => {
    if (!attemptId) return;

    if (!getAdminToken() && !getPublicToken()) {
      setError('Please sign in to view this result.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get(`/results/${attemptId}`, { meta: { scope } })
      .then((response) => {
        setResult(response.data || null);
      })
      .catch((err) => {
        setError(err?.message || 'Unable to load result analysis.');
      })
      .finally(() => setLoading(false));
  }, [attemptId, scope]);

  const seriesId = useMemo(() => resolveSeriesId(result), [result]);
  const backPath = useMemo(() => buildTestSeriesTestsPath(seriesId) || '/test-series', [seriesId]);
  const reattemptPath = useMemo(
    () => buildTestAttemptPath({ testId: result?.testId, seriesId }),
    [result?.testId, seriesId]
  );
  const dashboardPath = scope === 'admin' ? '/dashboard/student' : '/admin' ;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading result analysis...
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900">Result unavailable</h1>
          <p className="mt-4 text-sm text-slate-500">{error || 'The selected attempt could not be loaded.'}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/test-series" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Back to Test Series
            </Link>
            <Link href={dashboardPath} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subjectWise = result.subjectWise?.length ? result.subjectWise : [{ subject: 'Overall', correct: result.correct || 0, incorrect: result.incorrect || 0, notAttempted: result.notAttempted || 0 }];
  const stats = [
    { label: 'Correct', value: result.correct ?? 0, tone: 'emerald', helper: 'Questions answered correctly' },
    { label: 'Incorrect', value: result.incorrect ?? 0, tone: 'rose', helper: 'Questions attempted with a wrong answer' },
    { label: 'Not Attempted', value: result.notAttempted ?? 0, tone: 'amber', helper: 'Questions left unanswered' },
    { label: 'Accuracy', value: formatPercent(result.accuracy), tone: 'blue', helper: `${result.correct || 0} correct out of ${result.attempted || 0} attempted` },
    { label: 'Completion', value: formatPercent(result.completion), tone: 'slate', helper: `${result.attempted || 0} attempted out of ${result.totalQuestions || 0}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-8 py-10 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">Result Analysis</p>
                <h1 className="mt-3 text-3xl font-extrabold lg:text-4xl">{result.testName}</h1>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Attempt #{result.attemptNumber || 1}</span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Attempted {formatDateTime(result.attemptedAt)}</span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Time Taken {formatTimeTaken(result)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={backPath} className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20">
                  Back
                </Link>
                {reattemptPath ? (
                  <Link href={reattemptPath} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                    Reattempt Test
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 bg-slate-50 px-8 py-6 md:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Series</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{result.seriesName || 'Independent Test'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Score</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{result.obtainedMarks ?? result.score ?? 0} / {result.totalMarks || 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Questions</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{result.totalQuestions || 0}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Final Percentage</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{formatPercent(result.percentage)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === 'subject' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                onClick={() => setActiveTab('subject')}
              >
                Subject-wise
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setShowSolutions((current) => !current)}
              >
                {showSolutions ? 'Hide Solutions' : 'View Solutions'}
              </button>
              <button
                type="button"
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={() => setActiveTab('subject')}
              >
                View Analysis
              </button>
            </div>
          </div>

          {activeTab === 'all' ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Attempt Snapshot</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Attempted</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{result.attempted || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Allowed Duration</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{result.duration || 0} min</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Action Center</h2>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href={dashboardPath} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Open Dashboard
                  </Link>
                  <Link href={backPath} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Back to Test List
                  </Link>
                  {reattemptPath ? (
                    <Link href={reattemptPath} className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700">
                      Reattempt Test
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {subjectWise.map((item) => (
                <div key={item.subject} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h2 className="text-lg font-bold text-slate-900">{item.subject}</h2>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                      <p className="text-xs font-semibold uppercase tracking-wide">Correct</p>
                      <p className="mt-2 text-2xl font-extrabold">{item.correct}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                      <p className="text-xs font-semibold uppercase tracking-wide">Incorrect</p>
                      <p className="mt-2 text-2xl font-extrabold">{item.incorrect}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                      <p className="text-xs font-semibold uppercase tracking-wide">Skipped</p>
                      <p className="mt-2 text-2xl font-extrabold">{item.notAttempted}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {showSolutions ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Solutions</h2>
                <p className="mt-1 text-sm text-slate-500">Review each question, your answer, and the official solution.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {(result.questions || []).map((question, index) => (
                <div key={question.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{question.subject || 'Overall'} | Q{index + 1}</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{question.questionText}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${question.status === 'correct' ? 'bg-emerald-100 text-emerald-700' : question.status === 'incorrect' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {question.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {Object.entries(question.options || {}).map(([key, label]) => {
                      const isCorrect = question.correctAnswer === key;
                      const isSelected = question.selectedAnswer === key;
                      const optionClasses = isCorrect
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : isSelected
                          ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : 'border-slate-200 bg-white text-slate-700';

                      return (
                        <div key={key} className={`rounded-2xl border px-4 py-3 ${optionClasses}`}>
                          <p className="text-xs font-semibold uppercase tracking-wide">Option {key}</p>
                          <p className="mt-2 text-sm">{label}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your Answer</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{question.selectedAnswer || 'Not Attempted'}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Correct Answer</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{question.correctAnswer}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Marks</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{question.marks}</p>
                    </div>
                  </div>

                  {question.explanation ? (
                    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Explanation</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{question.explanation}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}