"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardPath } from "@/lib/redirects";

// 1. Extract the logic that uses searchParams into an inner component
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // This hook is now safely inside a component that will be wrapped in Suspense
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  async function handleSubmit() {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const store = useAuthStore.getState();
      await store.login({ email, password });
      const user = useAuthStore.getState().user;
      if (user) router.replace(getDashboardPath(user.role));
    } catch {
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Login</h1>

      {justRegistered && (
        <p className="text-green-600 text-sm bg-green-50 px-4 py-2 rounded w-full max-w-sm text-center">
          Account created successfully! Please log in.
        </p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-4 py-2 w-full max-w-sm"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-4 py-2 w-full max-w-sm"
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-full max-w-sm"
      >
        {submitting ? "Logging in..." : "Login"}
      </button>
      <a href="/register" className="text-sm text-blue-600 underline">
        Don't have an account? Register
      </a>
    </>
  );
}

// 2. Wrap the inner component with Suspense in the main page export
export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading form...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
