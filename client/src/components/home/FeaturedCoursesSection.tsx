"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/currency";

const FEATURED_COURSES = [
  {
    slug: "aerospace-structural-engineering-analysis",
    img: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80",
    tag: "Mechanical",
    title: "Advanced Mechanical Systems Design",
    prof: "Dr. James Walker",
    rating: "4.9",
    students: "3,420",
    hours: "42h",
    level: "Advanced",
    priceCents: 21900,
  },
  {
    slug: "cnc-programming-machining-fundamentals",
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80",
    tag: "CNC",
    title: "CNC Programming & Machining Fundamentals",
    prof: "Prof. Sarah Chen",
    rating: "4.8",
    students: "5,180",
    hours: "28h",
    level: "Beginner",
    priceCents: 9900,
  },
  {
    slug: "advanced-solidworks-parametric-design",
    img: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80",
    tag: "CAD",
    title: "AutoCAD & SolidWorks Masterclass",
    prof: "Emily Torres",
    rating: "4.9",
    students: "8,340",
    hours: "56h",
    level: "All Levels",
    priceCents: 12900,
  },
  {
    slug: "industrial-robotics-automation",
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80",
    tag: "Robotics",
    title: "Industrial Robotics & Automation",
    prof: "Dr. Kwame Osei",
    rating: "4.8",
    students: "1,960",
    hours: "48h",
    level: "Advanced",
    priceCents: 19900,
  },
] as const;

function EnrollAuthModal({
  courseTitle,
  courseSlug,
  onClose,
}: {
  courseTitle: string;
  courseSlug: string;
  onClose: () => void;
}) {
  const redirect = encodeURIComponent(`/courses/${courseSlug}`);
  const loginHref = `/login?redirect=${redirect}`;
  const registerHref = `/register?returnTo=${redirect}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-extrabold text-slate-900">Enroll in this course</h3>
        <p className="mt-2 text-sm text-slate-600">
          Sign in or create a free account to enroll in{" "}
          <span className="font-semibold text-slate-800">{courseTitle}</span>.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={loginHref}
            className="block w-full rounded-xl bg-[#196A54] py-3 text-center text-sm font-bold text-white hover:bg-[#12503F] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href={registerHref}
            className="block w-full rounded-xl border-2 border-slate-200 py-3 text-center text-sm font-bold text-slate-700 hover:border-[#196A54] hover:text-[#196A54] transition-colors"
          >
            Create free account
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedCoursesSection() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [authPrompt, setAuthPrompt] = useState<{ slug: string; title: string } | null>(null);

  function handleEnrollClick(
    e: React.MouseEvent,
    course: (typeof FEATURED_COURSES)[number]
  ) {
    if (isLoading || isAuthenticated) return;
    e.preventDefault();
    e.stopPropagation();
    setAuthPrompt({ slug: course.slug, title: course.title });
  }

  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-sm font-bold text-[#196A54] tracking-wider uppercase mb-2">Handpicked by Experts</p>
            <h2 className="text-4xl font-extrabold text-[#0A4A3A]">Featured Courses</h2>
            <p className="text-slate-500 mt-2 text-lg">Start with the most popular engineering programmes</p>
          </div>
          <Link
            href="/courses"
            className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-full font-bold text-slate-700 hover:border-[#196A54] hover:text-[#196A54] transition-colors"
          >
            Browse Courses
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_COURSES.map((course) => {
            const courseHref = `/courses/${course.slug}`;
            const enrollHref = isAuthenticated ? courseHref : undefined;

            return (
              <Link
                key={course.slug}
                href={courseHref}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden animate-pulse bg-slate-200">
                  <Image
                    src={course.img}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onLoad={(e) => {
                      const target = e.target as HTMLElement;
                      target.parentElement?.classList.remove("animate-pulse");
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-xs font-bold text-slate-700 shadow-sm">
                    {course.tag}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-[#196A54] transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">{course.prof}</p>

                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-slate-900">{course.rating}</span>
                    <span className="text-slate-400">({course.students} students)</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.hours}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {course.level}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-2xl font-extrabold text-[#0A4A3A]">
                      {formatPrice(course.priceCents)}
                    </span>
                    {enrollHref ? (
                      <span className="px-4 py-2 bg-[#196A54] text-white rounded-lg text-sm font-bold group-hover:bg-[#12503F] transition-colors">
                        View course
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleEnrollClick(e, course)}
                        className="px-4 py-2 bg-[#196A54] text-white rounded-lg text-sm font-bold hover:bg-[#12503F] transition-colors"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {authPrompt && (
        <EnrollAuthModal
          courseTitle={authPrompt.title}
          courseSlug={authPrompt.slug}
          onClose={() => setAuthPrompt(null)}
        />
      )}
    </section>
  );
}
