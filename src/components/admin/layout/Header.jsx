import { useAuthStore } from '../../../stores/authStore';
import Link from 'next/link';

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex justify-between items-center px-4 md:px-6 shrink-0">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-green-500">
          RJ Concept Website
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'Admin User'}</div>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer">
          {(user?.name || 'A').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
