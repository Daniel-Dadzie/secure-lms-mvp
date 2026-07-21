"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div>Student Dashboard — pending UI/UX designs</div>
    </ProtectedRoute>
  );
}