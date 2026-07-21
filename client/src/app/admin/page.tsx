"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div>Admin Dashboard — pending UI/UX designs</div>
    </ProtectedRoute>
  );
}