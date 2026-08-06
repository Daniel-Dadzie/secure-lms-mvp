"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
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

    const user = useAuthStore.getState().user;

    const role = user?.role;

    if (role === "ADMIN") router.push("/admin");
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

  // Quick demo filler helper
  function handleDemoLogin(roleType: "student" | "instructor" | "admin") {
    if (roleType === "student") {
      setEmail("student@mechspec.com");
      setPassword("Password123!");
    } else if (roleType === "instructor") {
      setEmail("instructor@mechspec.com");
      setPassword("Password123!");
    } else {
      setEmail("admin@mechspec.com");
      setPassword("Password123!");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F4F9F7]">
      
      {/* LEFT PANEL: Branding & Value Props (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0A4A3A] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Subtle background grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C2F25B_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-teal-800/80 border border-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#C2F25B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide">Mech Spec Technologies</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Welcome Back, Engineer.
          </h1>
          <p className="text-teal-100/80 text-base mb-8 max-w-md">
            Continue your learning journey and advance your engineering career.
          </p>

          <ul className="space-y-4 text-sm text-teal-50">
            <li className="flex items-center gap-3">
              <span className="p-1 rounded bg-[#196A54] text-[#C2F25B]">✓</span>
              Access 500+ engineering courses
            </li>
            <li className="flex items-center gap-3">
              <span className="p-1 rounded bg-[#196A54] text-[#C2F25B]">✓</span>
              Track progress and earn certificates
            </li>
            <li className="flex items-center gap-3">
              <span className="p-1 rounded bg-[#196A54] text-[#C2F25B]">✓</span>
              AI-powered learning assistant
            </li>
          </ul>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 bg-[#12503F]/80 border border-teal-700/50 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex text-amber-400 mb-2">★★★★★</div>
          <p className="text-sm italic text-teal-50 mb-4">
            &quot;The best engineering platform I&apos;ve used. Completely changed my career trajectory.&quot;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#196A54] border border-teal-600 flex items-center justify-center font-bold text-xs text-[#C2F25B]">
              AR
            </div>
            <div>
              <p className="text-sm font-bold text-white">Alex Rivera</p>
              <p className="text-xs text-teal-200">Mechanical Engineer · Boeing</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form Container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          {/* Top Nav Action */}
          <div className="flex justify-end mb-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-[#0A4A3A] transition-colors flex items-center gap-1">
              <span>←</span> Back to Home
            </Link>
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Sign in to your account</h2>
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-[#0A4A3A] hover:underline">
                  Create one free
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:border-transparent transition-all pr-16"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0A4A3A] focus:ring-[#0A4A3A]"
                  />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="font-medium text-[#0A4A3A] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0A4A3A] text-white rounded-xl text-sm font-bold hover:bg-[#12503F] transition-colors shadow-md disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        {/* QUICK DEMO ACCESS BAR (Per Chioma's design specification) */}
        <div className="mt-12 pt-6 border-t border-slate-200 max-w-md mx-auto w-full text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick demo access</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("student")}
              className="py-2 px-3 bg-white border border-slate-200 hover:border-[#0A4A3A] rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("instructor")}
              className="py-2 px-3 bg-white border border-slate-200 hover:border-[#0A4A3A] rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs"
            >
              📖 Instructor
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin")}
              className="py-2 px-3 bg-white border border-slate-200 hover:border-[#0A4A3A] rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs"
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}