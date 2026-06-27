// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useAuthStore } from '../../../stores/authStore';

// export default function Sidebar({ className = '' }) {
//   const { logout } = useAuthStore();
//   const router = useRouter();
//   const navItems = [
//     { name: 'Dashboard', href: '/admin' },
//     { name: 'Students', href: '/admin/students' },
//     { name: 'Courses', href: '/admin/courses' },
//     { name: 'Batches', href: '/admin/batches' },
//     { name: 'Test Series', href: '/admin/test-series' },
//     { name: 'Products', href: '/admin/products' },
//     { name: 'Notices', href: '/admin/notices' },
//     { name: 'Faculty Members', href: '/admin/faculty' },
//     { name: 'Fees', href: '/admin/fees' },
//     // { name: 'Attendance', href: '/admin/attendance' },
//     // { name: 'Exams', href: '/admin/exams' },
//     // { name: 'Leads', href: '/admin/leads' },
//     // { name: 'Analytics Data', href: '/dashboard/admin' },
//   ];

//   return (
//     <aside className={`bg-gray-900 text-white flex flex-col ${className}`}>
//       <div className="p-5 flex items-center gap-3 border-b border-gray-800">
//         <img src="/logo_rj.png" alt="RJ Concept" className="w-10 h-10 object-contain rounded-full" />
//         <h2 className="text-xl font-extrabold tracking-tight text-white">RJ CONCEPT</h2>
//       </div>
//       <div className="text-sm text-gray-400 px-8 flex items-center ">Admin Panel</div>
//       <nav className="flex-1 px-4 space-y-2">
//         {navItems.map((item) => (
//           <Link
//             key={item.name}
//             href={item.href}
//             className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
//           >
//             {item.name}
//           </Link>
//         ))}
//       </nav>
//       <div className="p-4 border-t border-gray-800">
//         <button
//           onClick={async () => {
//             await logout();
//             router.push('/admin/login');
//           }}
//           className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
//         >
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }


import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../stores/authStore';

export default function Sidebar({ className = '' }) {

  const { logout } = useAuthStore();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Students', href: '/admin/students' },
    { name: 'Courses', href: '/admin/courses' },
    { name: 'Batches', href: '/admin/batches' },
    { name: 'Test Series', href: '/admin/test-series' },
    { name: 'Results', href: '/admin/results' },
    { name: 'Gallery', href: '/admin/gallery' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Coupons', href: '/admin/coupons' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Payments', href: '/admin/payments' },
    { name: 'Refunds', href: '/admin/refunds' },
    { name: 'Notices', href: '/admin/notices' },
    { name: 'Faculty Members', href: '/admin/faculty' },
    { name: 'Fees', href: '/admin/fees' },
    { name: 'Study Material', href: '/admin/study-material' },
  ];

  return (

    <aside className={`bg-gray-900 text-gray-300 flex flex-col ${className}`}>

      {/* Logo */}

      <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-800">

        <img 
          src="/logo_rj.png"
          alt="RJ Concept"
          className="w-11 h-11 rounded-full object-cover"
        />

        <div>

          <h2 className="text-base font-semibold text-white">
            RJ CONCEPT
          </h2>

          <p className="text-xs text-gray-500">
            Admin Panel
          </p>

        </div>

      </div>


      {/* Navigation */}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">

        <p className="text-xs text-gray-500 px-3 mb-2 uppercase tracking-wider">
          Management
        </p>

        {navItems.map((item) => {

          const active = router.pathname === item.href;

          return (

            <Link
              key={item.name}
              href={item.href}

              className={`
                flex items-center px-3 py-2.5 text-sm rounded-lg
                transition-all duration-150

                ${active 
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-gray-800 hover:text-white'
                }
              `}
            >

              {item.name}

            </Link>

          );

        })}

      </nav>


      {/* Logout */}

      <div className="p-3 border-t border-gray-800">

        <button

          onClick={async () => {
            await logout();
            router.push('/admin/login');
          }}

          className="
            w-full flex items-center justify-center
            py-2.5 text-sm font-medium
            text-gray-400
            hover:text-white
            hover:bg-red-500/20
            rounded-lg
            transition
          "
        >

          Logout

        </button>

      </div>

    </aside>

  );

}
