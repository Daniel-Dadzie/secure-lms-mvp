"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function InstructorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <div>Instructor Dashboard — pending UI/UX designs</div>
    </ProtectedRoute>
  );
}