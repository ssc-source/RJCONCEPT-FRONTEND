import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePublicAuthStore } from '../stores/publicAuthStore';
import { pushToast } from '../stores/toastStore';
import Seo from '../components/Seo';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = usePublicAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      const redirect = typeof router.query.redirect === 'string' ? router.query.redirect : '/dashboard/student';
      pushToast({
        title: 'Signed in successfully',
        description: 'Your account is ready.',
        type: 'success',
      });
      router.push(redirect);
    } catch (err) {}
  };

  return (
    <>
      <Seo title="Student Login" noindex={true} />

      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
        <form onSubmit={submit} className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900">Sign In</h1>
          <p className="mt-2 text-sm text-slate-500">Use your account to access purchases and protected student flows.</p>
          {error && <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <div className="mt-6 space-y-4">
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button disabled={isLoading} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="mt-4 text-sm text-slate-500">No account? <Link href="/register" className="font-semibold text-blue-600">Register</Link></p>
        </form>
      </div>
    </>
  );
}
