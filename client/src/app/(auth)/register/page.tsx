"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

// Inner component that uses useSearchParams
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/student";

  const { register } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    
    // Frontend validation: Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: "STUDENT", // Assuming your backend assigns roles this way
      });
      router.push(returnTo);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to create account. Please check your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
          {errorMessage}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Daniel Yaw Dadzie"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="engineer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link
          href={`/login${returnTo !== "/student" ? `?returnTo=${returnTo}` : ""}`}
          className="font-bold text-blue-600 hover:text-blue-500"
        >
          Log in here
        </Link>
      </p>
    </>
  );
}

// Fallback shown while search params are being read
function RegisterFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 rounded-lg bg-slate-200" />
      <div className="h-10 rounded-lg bg-slate-200" />
      <div className="h-10 rounded-lg bg-slate-200" />
      <div className="h-10 rounded-lg bg-slate-200" />
    </div>
  );
}

// Page shell — no useSearchParams here, safe to prerender
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Start mastering industry-level engineering skills today.
          </p>
        </div>

        <Suspense fallback={<RegisterFormSkeleton />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}