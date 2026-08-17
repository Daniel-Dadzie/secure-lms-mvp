"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { BookOpen, CheckCircle, GraduationCap, Briefcase } from "lucide-react";
import { AuthBackground } from "@/components/auth/AuthBackground";

const REGISTER_IMAGE =
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1920";

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
      setErrorMessage("Failed to create account. Please check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end mb-1">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#0A4A3A] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Already have one?{" "}
          <Link
            href={
              returnTo !== "/student"
                ? `/login?redirect=${encodeURIComponent(returnTo)}`
                : "/login"
            }
            className="font-bold text-[#0A4A3A] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200">
          {errorMessage}
        </div>
      )}

      <form className="space-y-3.5" onSubmit={handleRegister}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            I want to join as
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col ${
                role === "STUDENT"
                  ? "border-[#0A4A3A] bg-emerald-50/40 ring-2 ring-[#0A4A3A]/20 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <GraduationCap className="w-5 h-5 text-[#0A4A3A] mb-1.5" />
              <p className="font-bold text-slate-900 text-sm">Student</p>
              <p className="text-xs text-slate-500 mt-0.5">Learn and grow</p>
            </button>

            <button
              type="button"
              onClick={() => setRole("INSTRUCTOR")}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col ${
                role === "INSTRUCTOR"
                  ? "border-[#0A4A3A] bg-emerald-50/40 ring-2 ring-[#0A4A3A]/20 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <Briefcase className="w-5 h-5 text-[#0A4A3A] mb-1.5" />
              <p className="font-bold text-slate-900 text-sm">Instructor</p>
              <p className="text-xs text-slate-500 mt-0.5">Teach and earn</p>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0A4A3A] focus:ring-[#0A4A3A] shrink-0"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-xl border border-transparent bg-[#0A4A3A] hover:bg-[#12503F] px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse w-full">
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-10 rounded-xl bg-slate-200" />
      <div className="h-24 rounded-xl bg-slate-200" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Image panel */}
      <div className="relative flex flex-col justify-center items-center text-white overflow-hidden px-6 py-10 lg:px-10 lg:py-12 min-h-[200px] lg:min-h-screen">
        <AuthBackground imageSrc={REGISTER_IMAGE} overlay="panel" className="hidden lg:block" />
        <AuthBackground imageSrc={REGISTER_IMAGE} overlay="mobile" className="lg:hidden" />

        <div className="relative z-10 w-full max-w-lg text-left space-y-6 lg:space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg lg:text-xl tracking-tight text-white">Mech Spec Technologies</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-lg">
              Start Your Engineering Journey Today
            </h1>
            <p className="text-emerald-50/95 text-base lg:text-lg mt-3 max-w-md leading-relaxed font-medium">
              Create your free account and get instant access to 500+ engineering courses taught by industry experts.
            </p>
          </div>

          <ul className="hidden lg:block space-y-3 text-base text-emerald-50/90">
            {[
              "Free access to starter courses",
              "Earn industry-recognized certificates",
              "Learn from top engineers worldwide",
              "Track progress with AI insights",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <p className="hidden lg:block text-sm text-emerald-200/90 pt-2 font-medium">
            © 2026 Mech Spec Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form panel — plain background */}
      <div className="min-h-0 lg:min-h-screen flex flex-col bg-[#F4F9F7]">
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-7">
              <Suspense fallback={<RegisterFormSkeleton />}>
                <RegisterForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
