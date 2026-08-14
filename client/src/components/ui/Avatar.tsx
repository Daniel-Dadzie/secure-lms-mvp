interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name, imageUrl, size = "md", className = "" }: AvatarProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name ?? "User avatar"}
        className={`shrink-0 rounded-full object-cover ring-2 ring-white/20 ${SIZE_CLASSES[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white ${SIZE_CLASSES[size]} ${className}`}
      aria-label={name ?? "User avatar"}
    >
      {initials}
    </div>
  );
}

