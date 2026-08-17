"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const token = searchParams.get("token");

    if (!token) {
      router.replace("/verify-email/error?message=Token is required");
      return;
    }

    async function verifyToken() {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        if (!cancelled) {
          router.replace("/verify-email/success");
        }
      } catch (err: any) {
        if (!cancelled) {
          const errorMessage = err.response?.data?.message || err.message || "Verification failed";
          router.replace(`/verify-email/error?message=${encodeURIComponent(errorMessage)}`);
        }
      }
    }

    void verifyToken();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-inner animate-pulse">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verifying Email...
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-inner animate-pulse">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
