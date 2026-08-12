"use client";

import { useEffect, useState } from "react";
import { Shield, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { Category } from "@/types/admin";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function reloadCategories() {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.categories ?? res.data ?? []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError("Could not load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/categories");
        if (!cancelled) {
          setCategories(res.data.categories ?? res.data ?? []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (!cancelled) {
          setError("Could not load categories.");
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

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (newCategoryName.trim().length < 2) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/categories", { name: newCategoryName.trim() });
      setNewCategoryName("");
      setSuccess("Category created successfully.");
      await reloadCategories();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create category.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!confirm("Delete this category? Courses in this category may be affected.")) {
      return;
    }

    setDeletingId(categoryId);
    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/categories/${categoryId}`);
      setSuccess("Category deleted successfully.");
      await reloadCategories();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete category.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your admin account and platform categories.
        </p>
      </div>

      {/* Account Info */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <Avatar name={user?.fullName} size="lg" />
          <div>
            <p className="text-lg font-bold text-slate-900">{user?.fullName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="purple">
                <Shield className="w-3 h-3 inline mr-1" />
                {user?.role}
              </Badge>
              {user?.isEmailVerified && (
                <Badge variant="green">Email verified</Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Management */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Categories</h2>
        <p className="text-sm text-slate-500 mb-6">
          Add or remove course categories for the platform catalog.
        </p>

        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            minLength={2}
            maxLength={100}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]/30"
            required
          />
          <Button
            type="submit"
            className="bg-[#0A4A3A] hover:bg-[#12503F]"
            isLoading={submitting}
          >
            Add Category
          </Button>
        </form>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        {success && <p className="text-sm text-emerald-600 mb-4">{success}</p>}

        {loading ? (
          <LoadingSkeleton className="h-32 w-full" />
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-500">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                  <p className="text-xs text-slate-500">
                    {category.courseCount ?? 0} course
                    {(category.courseCount ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  disabled={deletingId === category.id}
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Platform Announcements */}
      <AnnouncementsSection />
    </div>
  );
}

function AnnouncementsSection() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; metadata: Record<string, unknown>; createdAt: string; user?: { fullName: string } }>>([]);

  useEffect(() => {
    api.get("/admin/announcements").then((res) => setHistory(res.data.announcements ?? []));
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/announcements", {
        title,
        message,
        ...(targetRole && { targetRole }),
      });
      setTitle("");
      setMessage("");
      const res = await api.get("/admin/announcements");
      setHistory(res.data.announcements ?? []);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-2">Announcements</h2>
      <p className="text-sm text-slate-500 mb-6">Broadcast notifications to platform users.</p>
      <form onSubmit={handleSend} className="space-y-3 mb-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border px-3 py-2 text-sm" required />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" required />
        <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All users</option>
          <option value="STUDENT">Students only</option>
          <option value="INSTRUCTOR">Instructors only</option>
        </select>
        <Button type="submit" className="bg-[#0A4A3A]" isLoading={submitting}>Send Announcement</Button>
      </form>
      {history.length > 0 && (
        <ul className="divide-y divide-slate-100 text-sm">
          {history.slice(0, 5).map((item) => (
            <li key={item.id} className="py-2">
              <p className="font-semibold">{(item.metadata as { title?: string })?.title}</p>
              <p className="text-xs text-slate-500">{(item.metadata as { recipientCount?: number })?.recipientCount} recipients</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
