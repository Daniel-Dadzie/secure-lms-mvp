// src/app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardPath } from "@/lib/redirects";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  function handleRedirect() {
    if (isAuthenticated && user) {
      router.replace(getDashboardPath(user.role));
    } else {
      router.replace("/login");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 antialiased">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-4xl w-full p-6 sm:p-8 md:p-14 relative overflow-hidden">
        
        {/* Top Navbar Brand Mark */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Mech<span className="text-blue-600">Spec</span> Technologies
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          
          {/* Left Column: Interactive Glowing Security Graphic */}
          <div className="relative flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl p-8 md:p-10 border border-slate-100 group">
            
            {/* Red/Orange Ambient Backdrop on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-500/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            {/* Interactive Shield Element */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 transition-all duration-300 transform group-hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center shadow-inner group-hover:bg-red-500 group-hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-500 cursor-pointer">
                <svg className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
            </div>

            {/* Center Lock Illustration */}
            <div className="relative z-10 w-full flex flex-col justify-center items-center py-8">
              <div className="w-24 h-24 bg-slate-800 rounded-3xl shadow-lg flex items-center justify-center text-white relative transform transition-transform duration-500 group-hover:-translate-y-1">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {/* Animated Restricted Pulse Dot */}
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
              </div>
            </div>
          </div>

          {/* Right Column: Error Text & Actions */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-5xl md:text-6xl font-extrabold text-blue-600 tracking-tight mb-2">
              403
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
              Access Denied
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              You don&apos;t have permission to view this page. If you believe this is an error, please ensure you are logged into the correct account.
            </p>

            <div className="flex flex-wrap items-center gap-3 w-full">
              <button
                onClick={handleRedirect}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm text-center"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
