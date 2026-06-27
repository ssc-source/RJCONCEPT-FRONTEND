import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { buildTestResultPath } from '../utils/testRoutes';

export default function LegacyTestResultRedirectPage() {
  const router = useRouter();
  const { attemptId } = router.query;

  useEffect(() => {
    if (!attemptId) return;
    const nextPath = buildTestResultPath(attemptId);
    if (nextPath) {
      router.replace(nextPath);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900">Result link updated</h1>
        <p className="mt-4 text-sm text-slate-500">
          {attemptId ? 'Redirecting to the latest result page...' : 'A valid attempt id is required to open the result analysis page.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/test-series" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to Test Series
          </Link>
        </div>
      </div>
    </div>
  );
}
