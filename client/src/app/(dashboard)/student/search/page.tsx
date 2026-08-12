"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { BookOpen, Search, ArrowRight } from "lucide-react";

export default function StudentSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [courses, setCourses] = useState<Array<{ id: string; title: string; description: string }>>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query) return;

    startTransition(async () => {
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setCourses(response.data.results.courses || []);
      } catch (err) {
        console.error("Failed to load student search results:", err);
      }
    });
  }, [query]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
          <Search className="w-6 h-6 text-emerald-800" />
          Search Results for &ldquo;{query}&rdquo;
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isPending ? "Searching catalog..." : `Found ${courses.length} course(s) matching your query.`}
        </p>
      </div>

      {isPending ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {courses.length > 0 ? (
            <div className="grid gap-3">
              {courses.map((course) => (
                <Link 
                  key={course.id} 
                  href={`/student/courses/${course.id}`} 
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
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No courses found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                No learning materials matched &ldquo;{query}&rdquo;. Check the course catalog or try searching for another topic.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}