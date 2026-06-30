import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/authStore';
import Seo from '../../../components/Seo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/admin');
    } catch (error) {}
  };

  return (
    <>
      <Seo title="Admin Login" noindex={true} />

      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "url('/bg-login.jpg')" }}>
        <div className="absolute inset-0 bg-gray-900 opacity-80 backdrop-blur-sm"></div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center flex-col items-center">
            <div className="mb-4">
              <img
                src="/logo_rj.png"
                alt="RJ Concept ERP Logo"
                title="RJ Concept ERP"
                width={112}
                height={112}
                className="h-28 w-auto object-contain drop-shadow-sm rounded-full"
              />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              RJ CONCEPT ERP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Sign in to manage Institute Core Operations
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white py-10 px-8 shadow-2xl sm:rounded-2xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email / Username
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder="Enter admin email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
                >
                  {isLoading ? 'Authenticating...' : 'Secure Sign In'}
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
