interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  color?: "blue" | "green" | "amber" | "brand"; // Added 'brand'
  size?: "sm" | "md";
}

const COLOR_CLASSES = {
  blue:  "bg-blue-600",
  green: "bg-green-500",
  amber: "bg-amber-500",
  brand: "bg-[#0A4A3A]", // Added custom brand color matching the mockup
};

const SIZE_CLASSES = {
  sm: "h-1.5",
  md: "h-2",
};

export function ProgressBar({
  value,
  label,
  showPercent = false,
  color = "brand", // Defaulted to brand
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
          {label && <span>{label}</span>}
          {showPercent && <span>{clamped}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-200/60 ${SIZE_CLASSES[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${COLOR_CLASSES[color]}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}