"use client";

import { useState } from "react";
import Link from "next/link";
import * as authApi from "@/lib/auth.api";
import { BookOpen, Mail, CheckCircle2, ArrowLeft } from "lucide-react";

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
      {/* Standardized Brand Identity */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-[#0A4A3A] font-bold shadow-sm shrink-0">
          <BookOpen className="w-5 h-5 text-[#0A4A3A]" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-slate-900">
          Mech<span className="text-[#0A4A3A]">Spec</span> Technologies
        </span>
      </Link>

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full">
        {!submitted ? (
          <>
            {/* Envelope Icon Box */}
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0A4A3A] mb-6 border border-emerald-100 shadow-inner">
              <Mail className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
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
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4A3A] focus:ring-1 focus:ring-[#0A4A3A] transition bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0A4A3A] hover:bg-[#12503F] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition shadow-sm text-sm"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            {/* Success Checkmark Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Check your email
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
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
            className="text-sm font-semibold text-slate-500 hover:text-[#0A4A3A] inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}