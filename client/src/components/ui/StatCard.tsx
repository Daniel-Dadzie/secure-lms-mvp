interface StatCardProps {
  icon?: string | React.ReactNode;
  value: string | number;
  label: string;
  variant?: "default" | "transparent";
  trend?: string;
  className?: string;
  iconClassName?: string;
}

export function StatCard({
  icon,
  value,
  label,
  variant = "default",
  trend,
  className = "",
  iconClassName = "",
}: StatCardProps) {
  const isTransparent = variant === "transparent";

  return (
    <div
      className={`flex items-center gap-4 ${
        isTransparent
          ? "bg-transparent text-white"
          : `rounded-2xl border bg-white p-5 text-slate-900 ${className || "border-slate-200 shadow-sm"}`
      }`}
    >
      {icon && (
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 ${
            isTransparent
              ? "text-white/80"
              : iconClassName || "bg-[#F4F9F7] text-[#196A54]"
          }`}
        >
          {icon}
        </span>
      )}
      <div className="flex flex-col">
        <p
          className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
            isTransparent ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </p>
        <p
          className={`text-sm font-medium ${
            isTransparent ? "text-teal-50" : "text-slate-500"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
