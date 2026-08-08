interface StatCardProps {
  icon?: string | React.ReactNode; // Allow SVGs or emojis
  value: string | number;
  label: string;
  variant?: "default" | "transparent"; // Added variant for the hero banner
  className?: string;
}

export function StatCard({ icon, value, label, variant = "default", className = "" }: StatCardProps) {
  
  // Conditionally apply styles based on where the card is placed
  const isTransparent = variant === "transparent";
  
  return (
    <div
      className={`flex flex-col justify-center ${
        isTransparent 
          ? "bg-transparent text-white" 
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900"
      } ${className}`}
    >
      {icon && <span className="text-2xl mb-2">{icon}</span>}
      <div>
        <p className={`text-2xl md:text-3xl font-extrabold ${isTransparent ? "text-white" : "text-slate-900"}`}>
          {value}
        </p>
        <p className={`mt-0.5 text-sm font-medium ${isTransparent ? "text-teal-50" : "text-slate-500"}`}>
          {label}
        </p>
      </div>
    </div>
  );
}