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

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    const fetchCartCount = async () => {
      try {
        const res = await api.get("/cart");
        const items = res.data?.cart?.items ?? [];

        if (!cancelled) {
          setCartCount(items.length);
        }
      } catch {
        if (!cancelled) {
          setCartCount(0);
        }
      }
    };

    void fetchCartCount();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, pathname]);

  async function handleLogout() {
    await logout();
    setCartCount(0);
    router.push("/login");
  }

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/categories", label: "Categories" },
    { href: "/instructors", label: "Instructors" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "INSTRUCTOR"
        ? "/instructor"
        : "/student";

  const displayedCartCount = isAuthenticated ? cartCount : 0;

  return (
    // THE FIX: Added w-full to guarantee width across all mobile viewports
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A4A3A] text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.518 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold leading-tight text-[#0A4A3A]">
              Mech Spec
            </span>
            <span className="text-[10px] font-bold leading-none tracking-widest text-slate-400">
              TECHNOLOGIES
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#0A4A3A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-transparent hover:text-[#0A4A3A] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#0A4A3A] after:transition-transform hover:after:scale-x-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Cart — only for students or unauthenticated users */}
          {(!isAuthenticated || user?.role === "STUDENT") && (
            <Link
              href="/cart"
              className="group relative p-1 text-slate-600 transition-colors hover:text-[#0A4A3A]"
              aria-label="Shopping cart"
            >
              <svg
                className="h-6 w-6 transform transition-transform group-hover:scale-105"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              {displayedCartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {displayedCartCount > 9 ? "9+" : displayedCartCount}
                </span>
              )}
            </Link>
          )}

          <div className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Authenticated user */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardPath}
                className="hidden items-center gap-2 text-sm font-semibold text-[#0A4A3A] transition-colors hover:text-[#196A54] sm:flex"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A4A3A] text-xs font-bold text-white">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>

                <span className="hidden lg:block">
                  {user.fullName?.split(" ")[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-500 transition-colors hover:text-red-500"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-sm font-bold text-[#0A4A3A] transition-colors hover:text-[#196A54] sm:block"
              >
                Log In
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-[#0A4A3A] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#12503F]"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 py-4 lg:hidden">
          <div className="space-y-1 px-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive(href)
                    ? "bg-[#0A4A3A] text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}