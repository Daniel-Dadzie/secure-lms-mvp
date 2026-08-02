// src/components/courses/CourseCard.tsx
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface ApiCourse {
  id: string;
  title: string;
  instructorName?: string;
  priceCents: number; // 0 = Free
  averageRating?: number;
  reviewCount?: number;
  thumbnailUrl?: string | null;
  category?: {
    name: string;
  };
}

interface CourseCardProps {
  course: ApiCourse;
  isEnrolled?: boolean;        // Passed down if we know user's enrollment state
  isAuthenticated?: boolean;   // Passed down from auth store
  onEnrollFree: (courseId: string) => Promise<void>;
  onAddToCart: (courseId: string) => Promise<void>;
}

const FALLBACK_IMAGE_URL = "/images/course-fallback.jpg";

export const CourseCard = ({
  course,
  isEnrolled = false,
  isAuthenticated = false,
  onEnrollFree,
  onAddToCart,
}: CourseCardProps) => {
  const router = useRouter();
  const isFree = course.priceCents === 0;
  const formattedPrice = isFree
    ? "Free"
    : `$${(course.priceCents / 100).toFixed(2)}`;

  const handleActionClick = async () => {
    // 1. Guard: Unauthenticated users are sent to login with returnTo intent
    if (!isAuthenticated) {
      router.push(`/login?returnTo=/courses`);
      return;
    }

    // 2. Execute background action without navigating away from catalog
    try {
      if (isFree) {
        await onEnrollFree(course.id);
      } else {
        await onAddToCart(course.id);
      }
    } catch (error: any) {
      // 409 Already Enrolled fallback handling should be managed by the parent handler,
      // but we ensure no unhandled promise rejections crash the card.
      console.error("Action failed:", error?.message || error);
    }
  };

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div>
        {/* Thumbnail & Pastel Category Badge */}
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={course.thumbnailUrl || FALLBACK_IMAGE_URL}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {course.category?.name && (
            <span className="absolute left-3 top-3 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/10">
              {course.category.name}
            </span>
          )}
        </div>

        {/* Course Title & Instructor */}
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          <Link
            href={`/courses/${course.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
        </h3>
        {course.instructorName && (
          <p className="mt-1 text-sm text-slate-500">{course.instructorName}</p>
        )}

        {/* Rating Meta (No fabricated duration or difficulty badges) */}
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold text-amber-500">
            ★ {course.averageRating ? course.averageRating.toFixed(1) : "New"}
          </span>
          {course.reviewCount !== undefined && (
            <span className="text-slate-400">
              ({course.reviewCount.toLocaleString()})
            </span>
          )}
        </div>
      </div>

      {/* Footer Price & Dynamic Action Button */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xl font-extrabold text-slate-900">
          {formattedPrice}
        </span>

        {/* Proactive Enrollment State: Swap CTA entirely if already enrolled */}
        {isEnrolled ? (
          <Link
            href={`/student/courses/${course.id}`}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue Learning
          </Link>
        ) : (
          <button
            onClick={handleActionClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isFree ? "Enroll Free" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
};