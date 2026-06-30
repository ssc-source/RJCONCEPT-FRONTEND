import Link from 'next/link';
import Seo from '../components/Seo';

export default function Custom500() {
  return (
    <>
      <Seo title="Server Error" noindex={true} />

      <div className="flex min-h-[75vh] flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center">
        <div className="max-w-md bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-8xl mb-6 block">⚡</span>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">500</h1>
          <p className="mt-4 text-xl font-semibold text-slate-800">Server Connection Error</p>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            We are experiencing temporary technical difficulties. Please reload the page or check back shortly.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => typeof window !== 'undefined' && window.location.reload()}
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              Reload Page
            </button>
            <Link
              href="/"
              className="w-full rounded-xl bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
