// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardPath } from "@/lib/redirects";

// ----------------------------------------------------------------------------
// Testimonial/feature content — kept as local, swappable config rather than
// hardcoded JSX. The testimonial (name/company/quote) is placeholder content
// pending real user testimonials; swapping or removing it later is a one-line
// change here, not a page rewrite.
// ----------------------------------------------------------------------------
const FEATURES = [
  { emoji: "🎓", text: "Access engineering courses" },
  { emoji: "📊", text: "Track progress and earn certificates" },
  { emoji: "🤖", text: "AI-powered learning assistant" },
];

const TESTIMONIAL = {
  quote: "The best engineering platform I've used. Completely changed my career trajectory.",
  name: "Alex Rivera",
  role: "Mechanical Engineer",
  rating: 5,
};

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      if (user) {
        router.push(getDashboardPath(user.role));
      }
    } catch (err: any) {
      // Backend returns a generic message for both wrong email and wrong
      // password (user-enumeration prevention) — surfaced as-is, not
      // reinterpreted, so we don't accidentally leak more detail client-side
      // than the API deliberately withholds.
      const message =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel — branding, features, testimonial */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Brand Header with Standardized Vector SVG Icon & Color-Split Text */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0 border border-blue-500/40">
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
          <span className="text-lg font-bold tracking-tight text-white">
            Mech<span className="text-blue-400">Spec</span> Technologies
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Welcome Back,
          <br />
          Engineer.
        </h1>
        <p className="text-blue-100 text-lg mb-10">
          Continue your learning journey and advance your engineering career.
        </p>

        <ul className="space-y-4 mb-10">
          {FEATURES.map((feature) => (
            <li key={feature.text} className="flex items-center gap-3 text-blue-50">
              <span className="text-xl">{feature.emoji}</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="text-amber-400 mb-2" aria-hidden="true">
            {"★".repeat(TESTIMONIAL.rating)}
          </div>
          <p className="italic text-blue-50 mb-4">&ldquo;{TESTIMONIAL.quote}&rdquo;</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-sm font-semibold">
              {TESTIMONIAL.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="font-semibold text-sm">{TESTIMONIAL.name}</p>
              <p className="text-blue-200 text-xs">{TESTIMONIAL.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 bg-gray-50">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 mb-8 inline-flex items-center gap-1 w-fit"
        >
          ← Back to Home
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
        <p className="text-sm text-gray-600 mb-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-700 font-medium hover:underline">
            Create one free
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="max-w-md w-full" noValidate>
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3"
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}