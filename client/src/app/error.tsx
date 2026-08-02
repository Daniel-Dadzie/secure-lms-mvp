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
    // Log the error to an error reporting service if configured
    console.error("Global application boundary caught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-slate-900 antialiased">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 mb-8">
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

        {/* Error Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 max-w-md w-full text-center">
          {/* Error Icon Indicator */}
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-5 mx-auto border border-red-100">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Something went wrong!
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            An unexpected error occurred while loading this page. Our technical team has been notified.
          </p>

          {error?.digest && (
            <p className="text-xs font-mono text-slate-400 mb-6 bg-slate-50 p-2 rounded border border-slate-100">
              Error ID: {error.digest}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-sm text-sm"
            >
              Try again
            </button>
            <Link
              href="/"
              className="block w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}