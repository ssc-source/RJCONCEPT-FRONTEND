"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../stores/authStore';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = router.pathname;
  const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || pathname === '/admin/login') return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (user?.role === 'STUDENT') {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, isLoading, pathname, router, user]);

  if (!mounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  if (pathname === '/admin/login') {
    return <main>{children}</main>;
  }

  if ((!isAuthenticated || user?.role === 'STUDENT') && pathname !== '/admin/login') return null;

  return (
    <div className="flex bg-gray-50 h-screen font-sans overflow-hidden">
      <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <Sidebar className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 outline-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} />
      
      <div className="flex flex-col flex-1 shadow-inner h-screen overflow-hidden w-full">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
