import Image from "next/image";
import type { CSSProperties } from "react";

const DEFAULT_AUTH_IMAGE =
  "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1920";

/** Gradient overlays for auth image panels — darker for text legibility, still lighter at the leading edge. */
const OVERLAY_STYLES: Record<"panel" | "mobile", CSSProperties> = {
  panel: {
    background:
      "linear-gradient(90deg, rgba(10, 74, 58, 0.62) 0%, rgba(10, 74, 58, 0.78) 45%, rgba(10, 74, 58, 0.9) 100%)",
  },
  mobile: {
    background:
      "linear-gradient(180deg, rgba(10, 74, 58, 0.58) 0%, rgba(10, 74, 58, 0.75) 50%, rgba(10, 74, 58, 0.88) 100%)",
  },
};

interface AuthBackgroundProps {
  imageSrc?: string;
  overlay?: "panel" | "mobile";
  className?: string;
}

export function AuthBackground({
  imageSrc = DEFAULT_AUTH_IMAGE,
  overlay = "panel",
  className = "",
}: AuthBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      <div className="absolute inset-0 z-0">
        <Image src={imageSrc} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 z-10" style={OVERLAY_STYLES[overlay]} />
    </div>
  );
}

export const AUTH_BACKGROUND_IMAGE = DEFAULT_AUTH_IMAGE;
