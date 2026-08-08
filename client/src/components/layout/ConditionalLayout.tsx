"use client";

import { usePathname } from "next/navigation";
import  Navbar  from "@/components/layout/Navbar";
import  Footer  from "@/components/layout/Footer";
import { FloatingFAQAssistant } from "@/components/shared/FloatingFAQAssistant";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isWorkspace =
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/instructor") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/learn");

  if (isWorkspace) {
    return (
      <>
        {children}
        {/* FloatingFAQAssistant is global — appears on every page including
            workspace routes. The backend's optionalAuthenticate means it works
            identically for authenticated and unauthenticated users. */}
        <FloatingFAQAssistant />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <FloatingFAQAssistant />
      <Footer />
    </>
  );
}

