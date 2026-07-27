"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardPath } from "@/lib/redirects";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false); // local state only
  const router = useRouter();

async function handleSubmit() {
  if (!email || !password || !fullName) {
    setError("Please fill in all fields");
    return;
  }
  setError("");
  setSubmitting(true);
  try {
    // Call the API directly instead of the store
    // so we don't auto-set auth state
    const { register } = await import("@/lib/auth.api");
    await register({ email, password, fullName, role });

    // Clear the token that auto-set on register
    const { clearAccessToken } = await import("@/lib/api");
    clearAccessToken();

    // Redirect to login with a success message
    router.replace("/login?registered=true");
  } catch (err: any) {
    if (err?.response?.status === 409) {
      setError("An account with this email already exists.");
    } else {
      setError("Registration failed. Please try again.");
    }
  } finally {
    setSubmitting(false);
  }
}

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-2xl font-bold">Create Account</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="border rounded px-4 py-2 w-full max-w-sm"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-4 py-2 w-full max-w-sm"
      />
      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-4 py-2 w-full max-w-sm"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "STUDENT" | "INSTRUCTOR")}
        className="border rounded px-4 py-2 w-full max-w-sm"
      >
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-full max-w-sm"
      >
        {submitting ? "Creating account..." : "Register"}
      </button>
      <a href="/login" className="text-sm text-blue-600 underline">
        Already have an account? Login
      </a>
    </main>
  );
}