// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Hide Navbar completely on clean auth & password recovery routes
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  const getDashboardRoute = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "INSTRUCTOR") return "/instructor";
    return "/student";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* =========================================================================
            STANDARDIZED BRAND IDENTITY (Icon + "Mech" [slate-900] "Spec" [blue-600])
           ========================================================================= */}
        <Link href="/" className="flex items-center gap-2.5">
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
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Mech<span className="text-blue-600">Spec</span> Technologies
          </span>
        </Link>

        {/* Complete Navigation Links matching Chioma's top bar */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link
            href="/courses"
            className="hover:text-blue-600 transition-colors"
          >
            Courses
          </Link>
          <Link
            href="/instructors"
            className="hover:text-blue-600 transition-colors"
          >
            Instructors
          </Link>
          <Link
            href="/pricing"
            className="hover:text-blue-600 transition-colors"
          >
            Pricing
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            About
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href={getDashboardRoute()}
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};