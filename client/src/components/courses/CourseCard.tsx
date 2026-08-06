import Image from "next/image";
import Link from "next/link";

export interface ApiCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  instructor?: {
    fullName: string;
  };
}

interface CourseCardProps {
  course: ApiCourse;
  isAuthenticated: boolean;
  isEnrolled: boolean;
  onEnrollFree: (courseId: string) => void;
  onAddToCart: (courseId: string) => void;
  onBuyNow: (courseId: string) => void; // <--- NEW PROP
}

const FALLBACK_IMAGE = "/images/course-fallback.jpg"; // Update this path if needed

export function CourseCard({
  course,
  isEnrolled,
  onEnrollFree,
  onAddToCart,
  onBuyNow,
}: CourseCardProps) {
  const isFree = course.price === 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300">
      
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={course.thumbnailUrl || FALLBACK_IMAGE}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight mb-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-4">
          
          {/* Price & Instructor */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              By {course.instructor?.fullName || "MechSpec Staff"}
            </span>
            <span className={`font-bold ${isFree ? 'text-emerald-600' : 'text-slate-900 text-lg'}`}>
              {isFree ? "FREE" : `GH₵ ${course.price.toFixed(2)}`}
            </span>
          </div>

          {/* Intelligent Button Logic */}
          <div className="flex gap-2">
            {isEnrolled ? (
              // Enrolled State
              <Link
                href={`/learn/${course.id}`}
                className="w-full rounded-lg bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to Course
              </Link>
            ) : isFree ? (
              // Free Course State
              <button
                onClick={() => onEnrollFree(course.id)}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
              >
                Enroll for Free
              </button>
            ) : (
              // Premium Course State (The Dual Buttons)
              <>
                <button
                  onClick={() => onAddToCart(course.id)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
                  title="Add to cart and keep browsing"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => onBuyNow(course.id)}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                  title="Buy instantly"
                >
                  Buy Now
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}