// src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application boundary caught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-900 antialiased">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-4xl w-full p-8 md:p-14 relative overflow-hidden">
          
          {/* Top Navbar Brand Mark */}
          <div className="flex items-center justify-between mb-12">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Interactive Glowing Engineering Graphic (Plugs & Bulb) */}
            <div className="relative flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl p-10 border border-slate-100 group">
              
              {/* Glowing Ambient Backdrop on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

              {/* Interactive Glowing Bulb Element */}
              <div className="absolute top-6 right-6 transition-all duration-300 transform group-hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center shadow-inner group-hover:bg-amber-400 group-hover:shadow-[0_0_25px_rgba(251,191,36,0.8)] transition-all duration-500 cursor-pointer">
                  💡
                </div>
              </div>

              {/* Disconnected Plugs / Technical Illustration */}
              <div className="relative z-10 w-full max-w-[220px] h-48 flex flex-col justify-between items-center py-2">
                {/* Top Plug Winding Down */}
                <div className="w-full flex flex-col items-start">
                  <div className="w-28 h-4 border-t-2 border-l-2 border-slate-700 rounded-tl-lg" />
                  <div className="w-10 h-10 bg-slate-800 rounded-lg shadow-md flex items-center justify-center text-white mt-1 ml-24">
                    🔌
                  </div>
                </div>

                {/* Spark Indicators */}
                <div className="flex justify-between w-full px-6 text-blue-600 font-bold text-xs opacity-60 animate-pulse">
                  <span>⚡</span>
                  <span>⚡</span>
                </div>

                {/* Bottom Plug Winding Up */}
                <div className="w-full flex flex-col items-end">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg shadow-md flex items-center justify-center text-white mb-1 mr-24">
                    🔌
                  </div>
                  <div className="w-28 h-4 border-b-2 border-r-2 border-slate-700 rounded-br-lg" />
                </div>
              </div>
            </div>

            {/* Right Column: Error Text & Actions */}
            <div className="flex flex-col items-start text-left">
              <h2 className="text-6xl font-extrabold text-blue-600 tracking-tight mb-2">
                404
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Page Not Found
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                We&apos;re sorry, the page you requested could not be found. Please check the URL or go back to the homepage.
              </p>

              {error?.digest && (
                <p className="text-xs font-mono text-slate-400 mb-6 bg-slate-50 px-3 py-1.5 rounded border border-slate-100">
                  Error ID: {error.digest}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 w-full">
                <button
                  onClick={() => reset()}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                >
                  GO HOME
                </Link>
              </div>
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}