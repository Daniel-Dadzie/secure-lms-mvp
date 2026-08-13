"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/admin/formatters";
import type { AdminUser } from "@/types/admin";
import type { Role } from "@/types/auth";

interface UserTableProps {
  users: AdminUser[];
  onActivate: (userId: string) => Promise<void>;
  onDeactivate: (userId: string) => Promise<void>;
  onVerifyEmail: (userId: string) => Promise<void>;
  onResetPassword: (userId: string, newPassword: string) => Promise<void>;
}

function roleBadgeVariant(role: Role): "purple" | "blue" | "green" {
  if (role === "ADMIN") return "purple";
  if (role === "INSTRUCTOR") return "blue";
  return "green";
}

const stickyActionsHeader =
  "sticky right-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)]";
const stickyActionsCell =
  "sticky right-0 z-10 bg-white px-4 py-3 whitespace-nowrap align-middle shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.08)] group-hover:bg-slate-50/80";

export function UserTable({
  users,
  onActivate,
  onDeactivate,
  onVerifyEmail,
  onResetPassword,
}: UserTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  async function runAction(key: string, action: () => Promise<void>) {
    setActionLoading(key);
    try {
      await action();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resetUserId || newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }

    setResetError(null);
    await runAction(`reset-${resetUserId}`, () =>
      onResetPassword(resetUserId, newPassword)
    );
    setResetUserId(null);
    setNewPassword("");
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[960px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Verified
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Enrollments
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Joined
              </th>
              <th className={stickyActionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="group hover:bg-slate-50/80">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 max-w-[140px] truncate">
                  {user.fullName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 max-w-[180px] truncate">
                  {user.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={user.isActive ? "green" : "red"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={user.isEmailVerified ? "green" : "amber"}>
                    {user.isEmailVerified ? "Yes" : "No"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 text-center">
                  {user._count.enrollments}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                  {formatDateTime(user.createdAt)}
                </td>
                <td className={stickyActionsCell}>
                  <div className="flex flex-row flex-nowrap items-center gap-2">
                    {user.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 whitespace-nowrap border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                        disabled={actionLoading === `deactivate-${user.id}`}
                        onClick={() =>
                          runAction(`deactivate-${user.id}`, () =>
                            onDeactivate(user.id)
                          )
                        }
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 whitespace-nowrap !bg-[#0A4A3A] !text-white hover:!bg-[#12503F] border-0"
                        disabled={actionLoading === `activate-${user.id}`}
                        onClick={() =>
                          runAction(`activate-${user.id}`, () =>
                            onActivate(user.id)
                          )
                        }
                      >
                        Activate
                      </Button>
                    )}
                    {!user.isEmailVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 whitespace-nowrap"
                        disabled={actionLoading === `verify-${user.id}`}
                        onClick={() =>
                          runAction(`verify-${user.id}`, () =>
                            onVerifyEmail(user.id)
                          )
                        }
                      >
                        Verify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      className="h-8 whitespace-nowrap"
                      onClick={() => {
                        setResetUserId(user.id);
                        setNewPassword("");
                        setResetError(null);
                      }}
                    >
                      Reset PW
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter a new password for this user.
            </p>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
                minLength={8}
                required
              />
              {resetError && (
                <p className="text-sm text-red-500">{resetError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetUserId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0A4A3A] hover:bg-[#12503F] text-white"
                  isLoading={actionLoading === `reset-${resetUserId}`}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
