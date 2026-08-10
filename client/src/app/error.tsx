// src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 text-slate-900 antialiased">
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
          
          {/* Left Column: Interactive Glowing Engineering Graphic */}
          <div className="relative flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl p-8 md:p-10 border border-slate-100 group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            <div className="absolute top-4 right-4 md:top-6 md:right-6 transition-all duration-300 transform group-hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center shadow-inner group-hover:bg-amber-400 group-hover:shadow-[0_0_25px_rgba(251,191,36,0.8)] transition-all duration-500 cursor-pointer">
                {/* Lightbulb SVG */}
                <svg className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                </svg>
              </div>
            </div>

            <div className="relative z-10 w-full max-w-[200px] md:max-w-[220px] h-40 md:h-48 flex flex-col justify-between items-center py-2">
              <div className="w-full flex flex-col items-start">
                <div className="w-24 md:w-28 h-4 border-t-2 border-l-2 border-slate-700 rounded-tl-lg" />
                <div className="w-10 h-10 bg-slate-800 rounded-lg shadow-md flex items-center justify-center text-white mt-1 ml-20 md:ml-24">
                  {/* Plug SVG */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22v-5" />
                    <path d="M9 8V2" />
                    <path d="M15 8V2" />
                    <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
                  </svg>
                </div>
              </div>

              <div className="flex justify-between w-full px-6 text-blue-600 opacity-60 animate-pulse">
                {/* Spark/Zap SVG Left */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {/* Spark/Zap SVG Right */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              <div className="w-full flex flex-col items-end">
                <div className="w-10 h-10 bg-slate-800 rounded-lg shadow-md flex items-center justify-center text-white mb-1 mr-20 md:mr-24 transform rotate-180">
                  {/* Plug SVG (Rotated 180deg) */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22v-5" />
                    <path d="M9 8V2" />
                    <path d="M15 8V2" />
                    <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
                  </svg>
                </div>
                <div className="w-24 md:w-28 h-4 border-b-2 border-r-2 border-slate-700 rounded-br-lg" />
              </div>
            </div>
          </div>

          {/* Right Column: Error Text & Actions */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-5xl md:text-6xl font-extrabold text-blue-600 tracking-tight mb-2">
              Oops!
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
              Something went wrong.
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 md:mb-8">
              We encountered an unexpected error while loading this page. Our engineering team has been notified.
            </p>

            {error?.digest && (
              <p className="text-xs font-mono text-slate-400 mb-6 bg-slate-50 px-3 py-1.5 rounded border border-slate-100 break-all w-full">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={() => reset()}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm text-center"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm text-center"
              >
                GO HOME
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}