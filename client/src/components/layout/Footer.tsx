// src/components/layout/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide Footer completely on clean auth & password recovery routes
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* =========================================================================
              STANDARDIZED BRAND IDENTITY (Icon + "Mech" [white] "Spec" [blue-500])
             ========================================================================= */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Mech<span className="text-blue-500">Spec</span> Technologies
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering engineers worldwide with industry-leading technical
              education.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-white transition-colors"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/instructors"
                  className="hover:text-white transition-colors"
                >
                  Instructors
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/support"
                  className="hover:text-white transition-colors"
                >
                  FAQ &amp; Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Legal
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-slate-500 cursor-not-allowed">
                Privacy Policy
              </li>
              <li className="text-slate-500 cursor-not-allowed">
                Terms of Service
              </li>
            </ul>
          </div>
        </div>

        {/* Clean copyright line - Zero unverified compliance badges */}
        <div className="mt-12 border-t border-slate-800 pt-8 text-xs text-slate-500">
          <p>© {currentYear} MechSpec Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};