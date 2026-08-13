"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { UserTable } from "@/components/admin/UserTable";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { AdminUser } from "@/types/admin";
import type { Role } from "@/types/auth";

type RoleFilter = "ALL" | Role;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  async function reloadUsers() {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.users ?? []);
      setError(null);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/admin/users");
        if (!cancelled) {
          setUsers(res.data.users ?? []);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
        if (!cancelled) {
          setError("Could not load users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  async function handleActivate(userId: string) {
    await api.post(`/users/admin/users/${userId}/activate`);
    await reloadUsers();
  }

  async function handleDeactivate(userId: string) {
    await api.post(`/users/admin/users/${userId}/deactivate`);
    await reloadUsers();
  }

  async function handleVerifyEmail(userId: string) {
    await api.post(`/admin/users/${userId}/verify-email`);
    await reloadUsers();
  }

  async function handleResetPassword(userId: string, newPassword: string) {
    await api.post(`/users/admin/users/${userId}/reset-password`, { newPassword });
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage platform users, roles, and account status.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
        >
          <option value="ALL">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-12 w-full" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <UserTable
          users={filteredUsers}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onVerifyEmail={handleVerifyEmail}
          onResetPassword={handleResetPassword}
        />
      )}
    </div>
  );
}
