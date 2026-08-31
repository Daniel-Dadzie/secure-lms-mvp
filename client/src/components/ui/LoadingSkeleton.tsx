interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="h-52 w-full bg-slate-200" />
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="h-3 w-1/4 rounded bg-slate-200" />
        <div className="h-5 w-full rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-6 w-16 rounded bg-slate-200" />
          <div className="h-9 w-24 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-8 w-8 rounded-lg bg-slate-200" />
      <div className="mt-4 space-y-2">
        <div className="h-7 w-1/2 rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
      </div>
    </div>
  );
}