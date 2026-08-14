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
      className={`flex flex-col justify-between ${
        isTransparent
          ? "bg-transparent text-white"
          : `rounded-2xl border bg-white p-5 text-slate-900 ${className || "border-slate-200 shadow-sm"}`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {trend && !isTransparent && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
        {icon && (
          <span
            className={`ml-auto flex h-10 w-10 items-center justify-center rounded-xl ${
              isTransparent
                ? "text-white/80"
                : iconClassName || "bg-[#F4F9F7] text-[#196A54]"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      <div className={icon && !isTransparent ? "mt-3" : ""}>
        <p
          className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
            isTransparent ? "text-white" : "text-slate-900"
          }`}
        >
          {value}
        </p>
        <p
          className={`mt-1 text-sm font-medium ${
            isTransparent ? "text-teal-50" : "text-slate-500"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}