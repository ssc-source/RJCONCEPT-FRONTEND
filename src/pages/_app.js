import '../styles/globals.css';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AuthGuard from '../components/admin/AuthGuard';
import ToastViewport from '../components/feedback/ToastViewport';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import Seo from '../components/Seo';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // Identify administrative panel routes
  const isAdminRoute = router.pathname.startsWith('/admin');

  // Identify private/authenticated student and transactional routes
  const isPrivateStudentRoute = 
    router.pathname.startsWith('/dashboard') ||
    router.pathname.startsWith('/orders') ||
    router.pathname.startsWith('/checkout') ||
    router.pathname === '/cart' ||
    router.pathname === '/test-attempt' ||
    router.pathname === '/test-result' ||
    router.pathname.startsWith('/test-ranking') ||
    router.pathname.includes('/learn');

  if (isAdminRoute) {
    return (
      <>
        <Seo title="Admin Operations Portal" noindex={true} />
        <ToastViewport />
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </>
    );
  }

  return (
    <>
      {isPrivateStudentRoute && (
        <Seo title="Student Portal" noindex={true} />
      )}
      
      <ToastViewport />

      {/* Added padding to prevent overlap */}
      <div className="pb-20 md:pb-0">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>

      {/* Mobile Bottom Nav (only for public routes) */}
      <MobileBottomNav />
    </>
  );
}