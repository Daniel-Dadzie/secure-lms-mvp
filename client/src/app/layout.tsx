// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import our standardized structural layout components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingFAQAssistant } from "@/components/shared/FloatingFAQAssistant";

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
        {/* Persistent Header */}
        <Navbar />

        {/* Main Page Viewport */}
        <main className="flex-grow">{children}</main>

        {/* Floating FAQ Modal Trigger (Self-hides on auth/admin/instructor routes) */}
        <FloatingFAQAssistant />

        {/* Persistent Footer */}
        <Footer />
      </body>
    </html>
  );
}