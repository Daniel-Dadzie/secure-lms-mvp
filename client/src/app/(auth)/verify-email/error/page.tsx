"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

// 1. Inner component that safely consumes useSearchParams
function VerifyEmailErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Verification failed or the link has expired.";

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-inner">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Verification Failed
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {message}
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-sm"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

// 2. Fallback skeleton shown while search params are loading
function VerifyEmailErrorSkeleton() {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-6 animate-pulse">
      <div className="w-16 h-16 bg-slate-200 rounded-2xl mx-auto" />
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-slate-200 rounded w-full mx-auto" />
      </div>
      <div className="h-11 bg-slate-200 rounded-xl w-full" />
    </div>
  );
}

// 3. Default export wrapped in a Suspense boundary and shell layout
export default function VerifyEmailError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<VerifyEmailErrorSkeleton />}>
        <VerifyEmailErrorContent />
      </Suspense>
    </div>
  );
}