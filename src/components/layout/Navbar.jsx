"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Package, User, LogIn } from "lucide-react";
import { usePublicAuthStore } from '../../stores/publicAuthStore';
import { CART_CHANGED_EVENT, useCartStore } from '../../stores/cartStore';
import { AUTH_CHANGED_EVENT, getPublicToken } from '../../utils/auth';
import { getCart } from '../../services/cartClient';


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, checkAuth } = usePublicAuthStore();
  const count = useCartStore((state) => state.count);

  useEffect(() => {
    setIsMounted(true);
    // Only call checkAuth on mount when a session flag exists.
    // checkAuth itself also guards this, but skip early to avoid any overhead.
    if (getPublicToken()) {
      checkAuth();
    }
    getCart().catch(() => {});

    const syncAuth = () => {
      // Called after login/logout events; the store's own guard handles no-token case.
      checkAuth();
    };
    const syncCart = () => {
      getCart().catch(() => {});
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth);
    window.addEventListener(CART_CHANGED_EVENT, syncCart);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth);
      window.removeEventListener(CART_CHANGED_EVENT, syncCart);
    };
  }, [checkAuth]);

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
               <img src="/logo_rj.png" alt="RJ Concept Logo" className="h-10 w-auto" />
               <span className="text-2xl font-extrabold text-blue-900 tracking-tight">RJ CONCEPT</span>
            </Link>
          </div>
          <div className="hidden lg:ml-6 lg:flex lg:space-x-4">
            <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
            {/* <Link href="/about" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</Link> */}
            <Link href="/courses" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Courses</Link>
            <Link href="/store" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Store</Link>
            <Link href="/test-series" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Test Series</Link>
            
            <Link href="/study-material" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Study Material</Link>
            {/* <Link href="/faculty" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Faculty</Link> */}
            <Link href="/gallery" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Gallery</Link>
            <Link href="/results" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Results</Link>
            {/* <Link href="/blog" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Blog</Link> */}
            <Link href="/contact" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/cart"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium transition"
            >
            <span className="relative inline-flex">
              <ShoppingCart size={18} />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </span>
            </Link>
            <Link href="/orders" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"><Package size={18} /></Link>
            <Link href={isMounted && isAuthenticated ? '/dashboard/student' : '/login'} className="text-gray-600 font-semibold hover:text-blue-800 transition px-3 py-2 text-sm">
              {isMounted && isAuthenticated ? <User size={18}/> : <LogIn size={18}/>}
            </Link>
            
            <Link href="/admin" className="text-blue-600 font-bold hover:text-blue-800 transition px-3 py-2 text-sm ml-4">
              Admin
            </Link>
            {/* <Link href="/admissions" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition">
              Admissions Open
            </Link> */}
          </div>
          <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'} bg-white border-t border-gray-100 shadow-lg absolute w-full`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-gray-900 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Home</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">About</Link>
          <Link href="/courses" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Courses</Link>
          <Link href="/store" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Store</Link>
          <Link href="/test-series" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Test Series</Link>
          <Link href="/cart" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Cart</Link>
          <Link href="/orders" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">My Orders</Link>
          <Link href="/study-material" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Study Material</Link>
          {/* <Link href="/dashboard/student" onClick={() => setIsOpen(false)} className="block text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-md text-base">Student Portal</Link> */}
          <Link href="/faculty" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Faculty</Link>
          <Link href="/gallery" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Gallery</Link>
          <Link href="/results" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Results</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Blog</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Contact</Link>
          <Link href={isAuthenticated ? '/dashboard/student' : '/login'} onClick={() => setIsOpen(false)} className="block text-gray-500 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">
            {isAuthenticated ? 'Profile' : 'Login'}
            {count > 0 && !isAuthenticated ? ` (${count})` : ''}
          </Link>
        <Link href="/admin" className="block text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-md text-base">Admin</Link>
      </div>
      </div>
    </nav>
  );
}
