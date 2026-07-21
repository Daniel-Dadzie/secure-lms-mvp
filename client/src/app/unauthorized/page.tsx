"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { getDashboardPath } from "@/lib/redirects";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  function handleRedirect() {
    if (isAuthenticated && user) {
      router.replace(getDashboardPath(user.role));
    } else {
      router.replace("/login");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-gray-500">
        You don't have permission to view this page.
      </p>
      <button
        onClick={handleRedirect}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Go to your dashboard
      </button>
    </main>
  );
}