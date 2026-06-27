import Link from 'next/link';
import SocialIcons from '../common/SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo */}
          <div>

            <div className="flex items-center gap-3 mb-3">

              <img
                src="/logo_rj.png"
                className="h-10 w-10 rounded-full"
                alt="logo"
              />

              <h3 className="text-white font-semibold text-lg">
                RJ CONCEPT
              </h3>

            </div>

            <p className="text-gray-500 text-xs leading-relaxed">
              Trusted coaching institute for competitive exams in Bihar.
              Quality education with affordable fees.
            </p>

          </div>

          {/* Links */}
          <div>

            <h4 className="text-white font-medium mb-3">
              Links
            </h4>

            <ul className="space-y-1">

              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>

              <li>
                <Link href="/courses" className="hover:text-white transition">
                  Courses
                </Link>
              </li>

              <li>
                <Link href="/results" className="hover:text-white transition">
                  Results
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>

            </ul>

          </div>

          {/* Courses */}
          <div>

            <h4 className="text-white font-medium mb-3">
              Courses
            </h4>

            <ul className="space-y-1">

              <li>
                <Link href="/courses#upsc" className="hover:text-white transition">
                  UPSC / BPSC
                </Link>
              </li>

              <li>
                <Link href="/courses#ssc" className="hover:text-white transition">
                  SSC / Banking
                </Link>
              </li>

              <li>
                <Link href="/courses#defence" className="hover:text-white transition">
                  Defence
                </Link>
              </li>

              <li>
                <Link href="/courses#teaching" className="hover:text-white transition">
                  Teaching
                </Link>
              </li>

            </ul>

          </div>

          {/* Contact */}
          <div>

            <h4 className="text-white font-medium mb-3">
              Contact
            </h4>

            <ul className="space-y-2 text-xs">

              <li className="flex gap-2">
                📍 DIG Chowk, Purnia, Bihar
              </li>

              <li>
                📞 +91 9234829905
              </li>

              <li>
                ✉️ info@rjconcept.in
              </li>

            </ul>

            <div className="mt-3">
              <SocialIcons />
            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">

          <p>
            © 2026 RJ CONCEPT
          </p>

          <p>

            Developed by{" "}

            <Link
              href="https://www.seemanchalsmartvyapaar.com/"
              target='blank'
              className="text-gray-300 hover:text-white transition"
            >
              Seemanchal Smartvyapaar Consultancy
            </Link>

          </p>

          <div className="flex gap-4">

            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>

            <Link href="/refund" className="hover:text-white transition">
              Refund
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}