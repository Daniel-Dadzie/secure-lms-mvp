"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { uploadCourseThumbnail } from "@/lib/upload.api";

interface Category { id: string; name: string; }
interface Lesson { id: string; title: string; order: number; durationSeconds?: number; }
interface Module { id: string; title: string; order: number; lessons: Lesson[]; }

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  status: "DRAFT" | "PUBLISHED";
  thumbnailUrl: string | null;
  categoryId: string | null;
  learningObjectives: string[];
  modules: Module[];
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form state — initialised from fetched course
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Module/lesson management state
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCourse = useCallback(async () => {
    try {
      // Instructor view — use /instructor/mine to find course,
      // then fetch modules via the courses module endpoint
      const res = await api.get(`/courses/${courseId}`);
      const data = res.data.course || res.data;
      setCourse(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setPriceInput(data.priceCents ? (data.priceCents / 100).toFixed(2) : "");
      setCategoryId(data.categoryId || "");
      setThumbnailPreview(data.thumbnailUrl || null);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError("Course not found.");
      } else {
        setError("Failed to load course details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
    api.get("/categories").then((res) => {
      const data = res.data;
      setCategories(
        Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : []
      );
    }).catch(() => {});
  }, [fetchCourse]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG and WebP are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Thumbnail must be under 5MB."); return; }
    setError(null);
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Course title is required."); return; }

    const priceNumber = parseFloat(priceInput);
    const priceCents =
      !priceInput.trim() || isNaN(priceNumber) || priceNumber <= 0
        ? 0
        : Math.round(priceNumber * 100);

    setIsSaving(true);
    try {
      await api.patch(`/courses/${courseId}`, {
        title: title.trim(),
        description: description.trim(),
        priceCents,
        categoryId: categoryId || undefined,
      });

      if (thumbnailFile) {
        try {
          await uploadCourseThumbnail(courseId, thumbnailFile);
          setThumbnailFile(null);
        } catch {
          showToast("Course saved, but thumbnail upload failed. Please try again.");
          setIsSaving(false);
          return;
        }
      }

      showToast("Course saved successfully.");
      await fetchCourse();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save course.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!course) return;
    setIsPublishing(true);
    try {
      const endpoint =
        course.status === "PUBLISHED"
          ? `/courses/${courseId}/unpublish`
          : `/courses/${courseId}/publish`;
      // Correct method: PATCH (not POST) for publish/unpublish
      await api.patch(endpoint);
      showToast(
        course.status === "PUBLISHED"
          ? "Course unpublished — no longer visible to students."
          : "Course published — students can now enroll."
      );
      await fetchCourse();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update course status.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);
    try {
      await api.post(`/courses/${courseId}/modules`, {
        title: newModuleTitle.trim(),
        order: (course?.modules?.length ?? 0) + 1,
      });
      setNewModuleTitle("");
      showToast("Module added.");
      await fetchCourse();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add module.");
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;
    setIsAddingLesson(true);
    try {
      const targetModule = course?.modules?.find((m) => m.id === moduleId);
      await api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, {
        title: newLessonTitle.trim(),
        order: (targetModule?.lessons?.length ?? 0) + 1,
      });
      setNewLessonTitle("");
      showToast("Lesson added.");
      await fetchCourse();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add lesson.");
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons? This cannot be undone.")) return;
    try {
      await api.delete(`/courses/${courseId}/modules/${moduleId}`);
      showToast("Module deleted.");
      await fetchCourse();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete module.");
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    try {
      await api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
      showToast("Lesson deleted.");
      await fetchCourse();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete lesson.");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
        <div className="min-h-screen bg-slate-50 animate-pulse p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="h-8 w-1/2 rounded bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-48 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !course) {
    return (
      <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">
            Go Back
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
      <div className="min-h-screen bg-slate-50 pb-20">
        {toast && (
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
            {toast}
          </div>
        )}

        <header className="bg-white border-b border-slate-200 py-6 shadow-sm sticky top-0 z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-slate-500 hover:text-slate-900 transition text-sm"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 truncate max-w-xs">
                  {course?.title || "Edit Course"}
                </h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  course?.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {course?.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <button
              onClick={handlePublishToggle}
              disabled={isPublishing}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                course?.status === "PUBLISHED"
                  ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isPublishing
                ? "Updating..."
                : course?.status === "PUBLISHED"
                ? "Unpublish"
                : "Publish Course"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Course details form */}
          <form onSubmit={handleSave} className="space-y-8" noValidate>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Course Details</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Price (GH₵)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₵</span>
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
                      <option value="">No category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Thumbnail */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Thumbnail</h2>
              <p className="text-sm text-slate-500 mb-5">JPG, PNG or WebP · Max 5MB · 1280×720 recommended</p>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {thumbnailPreview ? (
                  <div className="relative h-36 w-64 shrink-0 overflow-hidden rounded-xl border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition rounded-xl">
                      <span className="text-white text-xs font-bold">Change</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="sr-only" />
                    </label>
                  </div>
                ) : (
                  <label className="flex h-36 w-64 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
                    <span className="text-3xl mb-2">🖼</span>
                    <span className="text-sm font-medium text-slate-600">Click to upload</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleThumbnailChange} className="sr-only" />
                  </label>
                )}
                {thumbnailFile && (
                  <p className="text-xs text-blue-600 font-medium self-center">
                    New thumbnail ready — will upload on save.
                  </p>
                )}
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim()}
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Curriculum builder */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Curriculum</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {course?.modules?.length ?? 0} module{(course?.modules?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Existing modules */}
            <div className="space-y-3 mb-6">
              {course?.modules?.map((module) => (
                <div key={module.id} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer"
                    onClick={() => setExpandedModuleId(
                      expandedModuleId === module.id ? null : module.id
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{module.title}</span>
                      <span className="text-xs text-slate-500">
                        {module.lessons?.length ?? 0} lesson{(module.lessons?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1"
                      >
                        Delete
                      </button>
                      <span className="text-slate-400 text-sm">
                        {expandedModuleId === module.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {expandedModuleId === module.id && (
                    <div className="px-4 py-3 space-y-2">
                      {module.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-700">{lesson.title}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(module.id, lesson.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      {/* Add lesson inline */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="New lesson title..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handleAddLesson(module.id); }
                          }}
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLesson(module.id)}
                          disabled={isAddingLesson || !newLessonTitle.trim()}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isAddingLesson ? "..." : "+ Lesson"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add module */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="New module title..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleAddModule(); }
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddModule}
                disabled={isAddingModule || !newModuleTitle.trim()}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {isAddingModule ? "Adding..." : "+ Module"}
              </button>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}