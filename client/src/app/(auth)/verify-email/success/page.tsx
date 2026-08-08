"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function VerifyEmailSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Email Verified!
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your email has been verified successfully. You can now log in and access your engineering courses.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm"
          >
            Login Now
          </Link>
        </div>
      </div>
    </div>
  );
}