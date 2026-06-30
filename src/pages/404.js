import Link from 'next/link';
import Seo from '../components/Seo';

export default function Custom404() {
  return (
    <>
      <Seo title="Page Not Found" noindex={true} />

      <div className="flex min-h-[75vh] flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center">
        <div className="max-w-md bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-8xl mb-6 block animate-bounce">🔍</span>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <p className="mt-4 text-xl font-semibold text-slate-800">Page Not Found</p>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
            >
              Back to Home
            </Link>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/courses"
                className="rounded-lg bg-slate-100 px-4 py-3.5 text-slate-700 hover:bg-slate-200 transition"
              >
                Explore Courses
              </Link>
              <Link
                href="/store"
                className="rounded-lg bg-slate-100 px-4 py-3.5 text-slate-700 hover:bg-slate-200 transition"
              >
                Go to Store
              </Link>
            </div>
            <Link
              href="/contact"
              className="text-xs text-slate-500 hover:text-slate-800 hover:underline mt-2"
            >
              Need help? Contact Admissions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
