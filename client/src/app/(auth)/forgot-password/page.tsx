"use client";

import { useState } from "react";
import Link from "next/link";
import * as authApi from "@/lib/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* =========================================================================
          STANDARDIZED BRAND IDENTITY (Icon + "Mech" [slate-900] "Spec" [blue-600])
         ========================================================================= */}
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

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 max-w-md w-full">
        {!submitted ? (
          <>
            {/* Crisp Light-Blue SVG Envelope Icon Box */}
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-100/50">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
                >
                  {error}
                </div>
              )}

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm mb-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition shadow-sm"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            {/* Success Checkmark SVG */}
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-5 mx-auto border border-emerald-100">
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
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              If an account exists for{" "}
              <strong className="text-slate-800">{email}</strong>, we&apos;ve
              sent a password reset link. It expires in 1 hour.
            </p>
          </div>
        )}

        {/* Divider and Return Link */}
        <hr className="my-6 border-slate-100" />
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition"
          >
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
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}