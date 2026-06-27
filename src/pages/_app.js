// import '../styles/globals.css';
// import { useRouter } from 'next/router';
// import Layout from '../components/Layout';
// import AuthGuard from '../components/admin/AuthGuard';
// import ToastViewport from '../components/feedback/ToastViewport';
// import ErrorBoundary from '../components/ErrorBoundary';

// export default function App({ Component, pageProps }) {
//   const router = useRouter();
  
//   // Protect the admin panel from rendering the public website Topbar/Footer
//   const isAdminRoute =
//     router.pathname.startsWith('/admin') ||
//     router.pathname.startsWith('/dashboard/admin') ||
//     router.pathname === '/test-series/[id]/student/[studentId]';

//   if (isAdminRoute) {
//     return (
//       <ErrorBoundary>
//         <ToastViewport />
//         <AuthGuard>
//           <Component {...pageProps} />
//         </AuthGuard>
//       </ErrorBoundary>
//     );
//   }

//   return (
//     <ErrorBoundary>
//       <ToastViewport />
//       <Layout>
//         <Component {...pageProps} />
//       </Layout>
//     </ErrorBoundary>
//   );
// }


import '../styles/globals.css';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AuthGuard from '../components/admin/AuthGuard';
import ToastViewport from '../components/feedback/ToastViewport';
import MobileBottomNav from '../components/layout/MobileBottomNav'; // ✅ ADDED

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // Protect the admin panel from rendering the public website Topbar/Footer
  const isAdminRoute = router.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <ToastViewport />
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </>
    );
  }

  return (
    <>
      <ToastViewport />

      {/* ✅ Added padding to prevent overlap */}
      <div className="pb-20 md:pb-0">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>

      {/* ✅ Mobile Bottom Nav (only for public routes) */}
      <MobileBottomNav />
    </>
  );
}