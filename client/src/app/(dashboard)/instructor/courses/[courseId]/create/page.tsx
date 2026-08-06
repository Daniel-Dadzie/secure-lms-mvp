"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { uploadCourseThumbnail } from "@/lib/upload.api";

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

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        const data = res.data;
        setCategories(
          Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : []
        );
      })
      .catch(() => {
        // Non-critical — categories can be assigned later
      });
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation matching backend's fileFilter exactly
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

    // Parse price — empty or "0" means free course
    const priceNumber = parseFloat(priceInput);
    const priceCents =
      !priceInput.trim() || isNaN(priceNumber) || priceNumber <= 0
        ? 0
        : Math.round(priceNumber * 100);

    setIsSubmitting(true);

    try {
      // Step 1: Create the course first — we need the returned courseId
      // before we can attach a thumbnail to it.
      const courseRes = await api.post("/courses", {
        title: title.trim(),
        description: description.trim(),
        priceCents,
        categoryId: categoryId || undefined,
      });

      const newCourse = courseRes.data.course || courseRes.data;
      const newCourseId = newCourse.id;

      // Step 2: Upload thumbnail if provided, using the real courseId
      if (thumbnailFile) {
        setIsUploading(true);
        try {
          await uploadCourseThumbnail(newCourseId, thumbnailFile);
        } catch (uploadErr) {
          // Thumbnail failure is non-fatal — course is already created.
          // Instructor can re-upload from the edit page.
          console.warn("Thumbnail upload failed, continuing:", uploadErr);
        } finally {
          setIsUploading(false);
        }
      }

      // Redirect to the edit page where they can add modules/lessons/quiz
      router.push(`/instructor/courses/${newCourseId}/edit`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create course. Please try again.");
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isUploading;

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white border-b border-slate-200 py-6 shadow-sm">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-slate-500 hover:text-slate-900 transition text-sm flex items-center gap-1"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create New Course</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  You can add modules and lessons after creating the course.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Basic info */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Basic Information</h2>

              <div className="space-y-5">
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
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-slate-400">{title.length}/200 characters</p>
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
                    placeholder="What will students learn? What topics are covered?"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Price (GH₵)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                        ₵
                      </span>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Leave empty or set to 0 for a free course.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Thumbnail */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Course Thumbnail</h2>
              <p className="text-sm text-slate-500 mb-5">
                JPG, PNG or WebP. Max 5MB. Recommended 1280×720px (16:9).
              </p>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {thumbnailPreview ? (
                  <div className="relative h-36 w-64 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex h-36 w-64 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                    <span className="text-3xl mb-2">🖼</span>
                    <span className="text-sm font-medium text-slate-600">Click to upload</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      className="sr-only"
                    />
                  </label>
                )}

                <p className="text-xs text-slate-500 leading-relaxed">
                  A good thumbnail significantly increases click-through rates. Choose a clear,
                  high-contrast image that represents the course content. You can change this
                  later from the course editor.
                </p>
              </div>
            </section>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isUploading
                  ? "Uploading thumbnail..."
                  : isSubmitting
                  ? "Creating course..."
                  : "Create Course"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}