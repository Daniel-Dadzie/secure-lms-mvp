"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardPath } from "@/lib/redirects";

const FEATURES = [
  "Free access to starter courses",
  "Earn industry-recognized certificates",
  "Learn from instructors worldwide",
  "Track your progress as you learn",
];

type RoleChoice = "STUDENT" | "INSTRUCTOR";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RoleChoice>("STUDENT");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    }
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    // Client-side only — confirmPassword is never sent to the backend,
    // it has no meaning there. This check exists purely to catch typos
    // before submitting.
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!agreedToTerms) {
      errors.terms = "You must agree to the Terms of Service and Privacy Policy";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      await register({ email, password, fullName, role });
      const user = useAuthStore.getState().user;
      if (user) {
        router.push(getDashboardPath(user.role));
      }
    } catch (err: any) {
      // Backend returns a generic 409 for duplicate emails deliberately
      // (never confirms whether an email is already registered) — shown
      // as-is, not reinterpreted into something more specific.
      const message =
        err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel */}
      <div className="md:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-8 md:p-12 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
            📖
          </div>
          <span className="text-lg font-bold">Mech Spec Technologies</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Start Your Engineering
          <br />
          Journey Today
        </h1>
        <p className="text-blue-100 text-lg mb-10">
          Create your free account and get instant access to our engineering
          courses.
        </p>

        <ul className="space-y-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-blue-50">
              <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-xs shrink-0">
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel */}
      <div className="md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 bg-gray-50">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 mb-8 inline-flex items-center gap-1 w-fit"
        >
          ← Back to Home
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
        <p className="text-sm text-gray-600 mb-8">
          Already have one?{" "}
          <Link href="/login" className="text-blue-700 font-medium hover:underline">
            Sign in
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
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Daniel Johnson"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {fieldErrors.fullName && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="daniel@company.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 8 characters)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-2">I want to join as</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`text-left border rounded-lg p-4 transition-colors ${
                  role === "STUDENT"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-xl mb-1">🎓</div>
                <div className="font-semibold text-sm text-gray-900">Student</div>
                <div className="text-xs text-gray-500">Learn and grow</div>
              </button>
              <button
                type="button"
                onClick={() => setRole("INSTRUCTOR")}
                className={`text-left border rounded-lg p-4 transition-colors ${
                  role === "INSTRUCTOR"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-xl mb-1">👨‍🏫</div>
                <div className="font-semibold text-sm text-gray-900">Instructor</div>
                <div className="text-xs text-gray-500">Teach and earn</div>
              </button>
            </div>
          </div>

          <div className="mb-2">
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-blue-700 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-700 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {fieldErrors.terms && (
              <p className="text-red-600 text-xs mt-1">{fieldErrors.terms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-blue-800 hover:bg-blue-900 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}