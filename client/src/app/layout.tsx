import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingFAQAssistant } from "@/components/shared/FloatingFAQAssistant";
import AuthProvider from "@/components/shared/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MechSpec Technologies — Engineering LMS",
  description:
    "Master mechanical engineering, CAD, robotics, and automation skills with industry experts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased`}
      >
        {/* AuthProvider MUST wrap everything that depends on auth state —
            it's what actually calls loadUser() on boot. Without this,
            isLoading never resolves and ProtectedRoute hangs forever. */}
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <FloatingFAQAssistant />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}