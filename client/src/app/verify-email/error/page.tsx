"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 1. Inner component that safely consumes useSearchParams
function VerifyEmailErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Verification failed";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
      <p className="text-gray-600">{message}</p>
      <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded">
        Back to Login
      </a>
    </main>
  );
}

// 2. Default export wrapped in a Suspense boundary
export default function VerifyEmailError() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <VerifyEmailErrorContent />
    </Suspense>
  );
}