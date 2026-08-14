"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AuthBackground } from "@/components/auth/AuthBackground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || searchParams.get("returnTo");
  const registerHref = redirectTo
    ? `/register?returnTo=${encodeURIComponent(redirectTo)}`
    : "/register";
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ email, password });

      if (redirectTo && redirectTo.startsWith("/")) {
        router.push(redirectTo);
        return;
      }

      const user = useAuthStore.getState().user;
      const role = user?.role;

      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "INSTRUCTOR") router.push("/instructor");
      else router.push("/student");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Image panel — desktop left / mobile top banner */}
      <div className="relative flex flex-col justify-center items-center text-white overflow-hidden px-6 py-10 lg:px-10 lg:py-12 min-h-[220px] lg:min-h-screen">
        <AuthBackground overlay="panel" className="hidden lg:block" />
        <AuthBackground overlay="mobile" className="lg:hidden" />

        <div className="relative z-10 w-full max-w-lg text-left space-y-4 lg:space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-800/80 border border-teal-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#C2F25B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="font-bold text-base lg:text-lg tracking-wide">Mech Spec Technologies</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Welcome Back, Engineer.
            </h1>
            <p className="text-teal-100/90 text-sm lg:text-base mt-2 max-w-md">
              Continue your learning journey and advance your engineering career.
            </p>
          </div>

          <ul className="hidden lg:block space-y-2 text-sm text-teal-50">
            {[
              "Access 500+ engineering courses",
              "Track progress and earn certificates",
              "AI-powered learning assistant",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="p-0.5 rounded bg-[#196A54] text-[#C2F25B] text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="hidden lg:block mt-6 bg-[#12503F]/75 border border-teal-700/40 p-4 rounded-xl backdrop-blur-sm text-left">
            <div className="flex text-amber-400 text-sm mb-1.5">★★★★★</div>
            <p className="text-sm italic text-teal-50 mb-3">
              &quot;The best engineering platform I&apos;ve used. Completely changed my career trajectory.&quot;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#196A54] border border-teal-600 flex items-center justify-center font-bold text-xs text-[#C2F25B]">
                AR
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alex Rivera</p>
                <p className="text-xs text-teal-200">Mechanical Engineer · Boeing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel — plain background, no image overlay */}
      <div className="min-h-0 lg:min-h-screen flex flex-col bg-[#F4F9F7]">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-7">
              <div className="flex justify-end mb-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-500 hover:text-[#0A4A3A] transition-colors inline-flex items-center gap-1"
                >
                  <span>←</span> Back to Home
                </Link>
              </div>

              <div className="mb-5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Sign in to your account
                </h2>
                <p className="text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link href={registerHref} className="font-bold text-[#0A4A3A] hover:underline">
                    Create one free
                  </Link>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email"
                         className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password"
                         className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:border-transparent transition-all pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0A4A3A] focus:ring-[#0A4A3A]"
                    />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#0A4A3A] hover:underline sm:text-right"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0A4A3A] text-white rounded-xl text-sm font-bold hover:bg-[#12503F] transition-colors shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
