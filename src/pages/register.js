import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../services/api';
import { pushToast } from '../stores/toastStore';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setMessage('Account created. You can sign in now.');
      pushToast({
        title: 'Account created',
        description: 'You can now sign in and continue checkout.',
        type: 'success',
      });
      const redirect = typeof router.query.redirect === 'string' ? router.query.redirect : '';
      setTimeout(() => router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'), 800);
    } catch (error) {
      setMessage(error.message || 'Registration failed');
      pushToast({
        title: 'Registration failed',
        description: error.message || 'Unable to create your account.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <form onSubmit={submit} className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900">Create Account</h1>
        <p className="mt-2 text-sm text-slate-500">Register as an external learner for tests and purchases.</p>
        {message && <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</div>}
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="mt-4 text-sm text-slate-500">
          Already registered?{' '}
          <Link href={typeof router.query.redirect === 'string' ? `/login?redirect=${encodeURIComponent(router.query.redirect)}` : '/login'} className="font-semibold text-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
