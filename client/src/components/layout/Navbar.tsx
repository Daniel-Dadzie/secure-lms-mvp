"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  // Fetch real cart count when authenticated
  useEffect(() => {
    if (!isAuthenticated) { setCartCount(0); return; }
    api.get("/cart")
      .then((res) => {
        const items = res.data?.cart?.items ?? [];
        setCartCount(items.length);
      })
      .catch(() => setCartCount(0));
  }, [isAuthenticated, pathname]); // re-fetch on route change

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/categories", label: "Categories" },
    { href: "/support", label: "Support" },
  ];

  const dashboardPath =
    user?.role === "ADMIN" ? "/admin"
    : user?.role === "INSTRUCTOR" ? "/instructor"
    : "/student";

  return (
    <nav className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#196A54] text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-[#0A4A3A] leading-tight">Mech Spec</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest leading-none">TECHNOLOGIES</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(href)
                    ? "bg-[#0A4A3A] text-white"
                    : "text-slate-600 hover:text-[#196A54] hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Cart — only for students or unauthenticated */}
            {(!isAuthenticated || user?.role === "STUDENT") && (
              <Link href="/cart" className="relative text-slate-600 hover:text-[#196A54] transition-colors p-1 group">
                <svg className="w-6 h-6 transform group-hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border-2 border-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={dashboardPath}
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#0A4A3A] hover:text-[#196A54] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#196A54] flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{user.fullName?.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden sm:block text-sm font-bold text-[#0A4A3A] hover:text-[#196A54] transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="rounded-lg bg-[#196A54] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#12503F] transition-colors">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(href) ? "bg-[#0A4A3A] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">
                Log In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}