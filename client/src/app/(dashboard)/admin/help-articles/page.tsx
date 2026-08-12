"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { HelpArticle } from "@/types/admin";

type ArticleForm = {
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
  order: number;
};

const EMPTY_FORM: ArticleForm = {
  title: "",
  content: "",
  category: "general",
  isPublished: false,
  order: 0,
};

const actionBtn =
  "inline-flex items-center justify-center h-8 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap";

export default function AdminHelpArticlesPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/help-articles");
      setArticles(res.data.articles ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(article: HelpArticle) {
    setShowForm(false);
    setEditingId(article.id);
    setForm({
      title: article.title,
      content: article.content,
      category: article.category,
      isPublished: article.isPublished,
      order: article.order,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/help-articles", form);
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchArticles();
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      await api.patch(`/admin/help-articles/${editingId}`, form);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await fetchArticles();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(article: HelpArticle) {
    await api.patch(`/admin/help-articles/${article.id}`, { isPublished: !article.isPublished });
    fetchArticles();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await api.delete(`/admin/help-articles/${id}`);
    if (editingId === id) cancelEdit();
    fetchArticles();
  }

  function renderFormFields(
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string,
    onCancel: () => void
  ) {
    return (
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        />
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="Content"
          rows={6}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            required
          />
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
            placeholder="Display order"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="bg-[#0A4A3A] hover:bg-[#12503F] h-9 px-4">
            {saving ? "Saving..." : submitLabel}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving} className="h-9 px-4">
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Help Articles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Published articles appear on the{" "}
            <Link href="/student/help-center" className="text-[#196A54] font-semibold hover:underline">
              Student Help Center
            </Link>
            , public{" "}
            <Link href="/help" className="text-[#196A54] font-semibold hover:underline">
              Help page
            </Link>
            , and the floating FAQ assistant.
          </p>
        </div>
        <Button className="bg-[#0A4A3A] hover:bg-[#12503F] h-9 px-4 shrink-0" onClick={startCreate}>
          Add Article
        </Button>
      </div>

      {showForm && renderFormFields(handleCreate, "Create", () => setShowForm(false))}

      {loading ? (
        <LoadingSkeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id}>
              {editingId === a.id ? (
                renderFormFields(handleSave, "Save Changes", cancelEdit)
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 items-start">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {a.category} · Order {a.order}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{a.content}</p>
                    <Badge variant={a.isPublished ? "green" : "amber"} className="mt-2">
                      {a.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex flex-row items-center gap-2 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => startEdit(a)}
                      className={`${actionBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(a)}
                      className={`${actionBtn} ${
                        a.isPublished
                          ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "bg-[#0A4A3A] text-white hover:bg-[#12503F]"
                      }`}
                    >
                      {a.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className={`${actionBtn} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
