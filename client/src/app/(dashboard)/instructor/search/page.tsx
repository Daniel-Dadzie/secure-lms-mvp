"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { BookOpen, Users, FileText, Video, Search, ArrowRight } from "lucide-react";

interface SearchResults {
  courses: Array<{ id: string; title: string; description: string }>;
  students: Array<{ id: string; fullName: string; email: string }>;
  modules: Array<{ id: string; title: string }>;
  videos: Array<{ id: string; title: string; durationSeconds: number }>;
}

export default function InstructorSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    startTransition(async () => {
      setErrorMessage(null);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(response.data.results);
      } catch (err) {
        console.error("Failed to fetch search results:", err);
        setErrorMessage("Unable to complete search request. Please try again.");
      }
    });
  }, [query]);

  const totalResultsCount = results
    ? results.courses.length + results.students.length + results.modules.length + results.videos.length
    : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <Search className="w-6 h-6 text-emerald-800" />
            Search Results for &ldquo;{query}&rdquo;
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isPending ? "Searching platform databases..." : `Found ${totalResultsCount} matching record(s) across your portal.`}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isPending ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      ) : results ? (
        <div className="space-y-8">
          
          {/* Courses */}
          {results.courses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" /> Courses ({results.courses.length})
              </h2>
              <div className="grid gap-3">
                {results.courses.map((course) => (
                  <Link 
                    key={course.id} 
                    href={`/instructor/courses/${course.id}`} 
                    className="group block p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-700 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">{course.title}</p>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-800 transition-colors" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{course.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Students */}
          {results.students.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-700" /> Students ({results.students.length})
              </h2>
              <div className="grid gap-3">
                {results.students.map((student) => (
                  <div key={student.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{student.fullName}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Modules */}
          {results.modules.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-700" /> Modules ({results.modules.length})
              </h2>
              <div className="grid gap-3">
                {results.modules.map((mod) => (
                  <div key={mod.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <p className="font-bold text-slate-900">{mod.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {results.videos.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-700" /> Lessons & Videos ({results.videos.length})
              </h2>
              <div className="grid gap-3">
                {results.videos.map((vid) => (
                  <div key={vid.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <p className="font-bold text-slate-900">{vid.title}</p>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {Math.round(vid.durationSeconds / 60)} mins
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {totalResultsCount === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No matches found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                No courses, students, or modules matched &ldquo;{query}&rdquo;. Try checking your spelling or using alternative keywords.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}