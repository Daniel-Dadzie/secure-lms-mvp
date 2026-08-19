"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { uploadCourseThumbnail } from "@/lib/upload.api";
import { convertUSDToGHS } from "@/lib/currency";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const res = await api.get("/categories");
        if (cancelled) return;
        const data = res.data;
        setCategories(
          Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : []
        );
      } catch {
        // categories optional at create time
      }
    }

    void loadCategories();
    return () => { cancelled = true; };
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG and WebP are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Thumbnail must be under 5MB.");
      return;
    }
    setError(null);

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    const priceNumber = parseFloat(priceInput);
    // Convert USD input to GHS for storage (transactions remain in GHS)
    const priceGHS = !priceInput.trim() || isNaN(priceNumber) || priceNumber <= 0
      ? 0
      : convertUSDToGHS(priceNumber);
    const priceCents = Math.round(priceGHS * 100);

    setIsSubmitting(true);
    try {
      const courseRes = await api.post("/courses", {
        title: title.trim(),
        description: description.trim(),
        priceCents,
        categoryId: categoryId || undefined,
      });
      const newCourse = courseRes.data.course || courseRes.data;
      const newCourseId = newCourse.id;

      if (thumbnailFile) {
        setIsUploading(true);
        try {
          await uploadCourseThumbnail(newCourseId, thumbnailFile);
        } catch (uploadErr: any) {
          console.error("Thumbnail upload failed:", uploadErr);
          const errorMsg = uploadErr?.response?.data?.message || uploadErr?.message || "Thumbnail upload failed";
          setError(`Course created but thumbnail upload failed: ${errorMsg}. You can add it in the edit page.`);
          // Continue anyway - course is created
        } finally {
          setIsUploading(false);
        }
      }

      router.push(`/instructor/courses/${newCourseId}/edit`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create course. Please try again.";
      setError(message);
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isUploading;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/instructor/courses" className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to courses
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Create New Course</h1>
        <p className="text-sm text-slate-500 mt-1">Add modules and lessons after creating the course.</p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Mechanical Design"
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54]"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#196A54] resize-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Price (USD)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Course Thumbnail</h2>
          {thumbnailPreview ? (
            <div className="relative h-36 w-64 overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex h-36 w-64 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              <span className="text-sm font-medium text-slate-600">Click to upload</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="sr-only" />
            </label>
          )}
        </section>

        <div className="flex justify-end gap-3">
          <Link href="/instructor/courses" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="rounded-lg bg-[#196A54] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
