"use client";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailError() {
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