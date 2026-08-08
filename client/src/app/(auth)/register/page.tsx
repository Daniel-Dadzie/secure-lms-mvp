"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { BookOpen, CheckCircle, GraduationCap, Briefcase } from "lucide-react";

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
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });
      const destination = role === "INSTRUCTOR" ? "/instructor" : returnTo;
      router.push(destination);
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
    <div className="w-full max-w-md space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#0A4A3A] mb-4 transition-colors"
        >
          ← Back to Home
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Already have one?{" "}
          <Link
            href={`/login${returnTo !== "/student" ? `?returnTo=${returnTo}` : ""}`}
            className="font-bold text-[#0A4A3A] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">
          {errorMessage}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleRegister}>
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
            className="relative block w-full appearance-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-[#0A4A3A] focus:outline-none focus:ring-1 focus:ring-[#0A4A3A] sm:text-sm bg-white"
            placeholder="Daniel Johnson"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="relative block w-full appearance-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-[#0A4A3A] focus:outline-none focus:ring-1 focus:ring-[#0A4A3A] sm:text-sm bg-white"
            placeholder="daniel@company.com"
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
            className="relative block w-full appearance-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-[#0A4A3A] focus:outline-none focus:ring-1 focus:ring-[#0A4A3A] sm:text-sm bg-white"
            placeholder="Create a strong password"
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
            className="relative block w-full appearance-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-[#0A4A3A] focus:outline-none focus:ring-1 focus:ring-[#0A4A3A] sm:text-sm bg-white"
            placeholder="Repeat your password"
          />
        </div>

        {/* Role Selection Cards with SVG Icons */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            I want to join as
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                role === "STUDENT"
                  ? "border-[#0A4A3A] bg-emerald-50/40 ring-2 ring-[#0A4A3A]/20 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <GraduationCap className="w-6 h-6 text-[#0A4A3A] mb-2" />
              <div>
                <p className="font-bold text-slate-900 text-sm">Student</p>
                <p className="text-xs text-slate-500 mt-0.5">Learn and grow</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("INSTRUCTOR")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                role === "INSTRUCTOR"
                  ? "border-[#0A4A3A] bg-emerald-50/40 ring-2 ring-[#0A4A3A]/20 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <Briefcase className="w-6 h-6 text-[#0A4A3A] mb-2" />
              <div>
                <p className="font-bold text-slate-900 text-sm">Instructor</p>
                <p className="text-xs text-slate-500 mt-0.5">Teach and earn</p>
              </div>
            </button>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start space-x-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0A4A3A] focus:ring-[#0A4A3A]"
          />
          <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
            I agree to the{" "}
            <a href="#" className="text-[#0A4A3A] font-semibold hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#0A4A3A] font-semibold hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full justify-center rounded-xl border border-transparent bg-[#0A4A3A] hover:bg-[#12503F] px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Fallback skeleton
function RegisterFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse w-full max-w-md">
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-24 rounded-xl bg-slate-200" />
    </div>
  );
}

// Split-screen page shell with vertically centered left branding panel
export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Branding Panel - Vertically Centered */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A4A3A] text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-lg mx-auto w-full my-auto space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-tight">Mech Spec Technologies</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Start Your Engineering Journey Today
            </h1>
            <p className="text-emerald-100 text-sm max-w-md mb-8 leading-relaxed">
              Create your free account and get instant access to 500+ engineering courses.
            </p>

            <ul className="space-y-4 text-sm text-emerald-100">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Free access to starter courses</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Earn industry-recognized certificates</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Learn from top engineers worldwide</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Track progress with AI insights</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-emerald-300 pt-4">
            © 2026 Mech Spec Technologies Ltd. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24 bg-slate-50">
        <div className="mx-auto w-full max-w-md">
          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}