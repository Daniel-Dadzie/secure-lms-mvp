import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import { GlobalSupportWidget } from "@/components/layout/GlobalSupportWidget";
import { IdleTimer } from "@/components/auth/IdleTimer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MechSpec Technologies — Engineering LMS",
  description: "Master mechanical engineering, CAD, robotics, and automation skills with industry experts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} font-sans min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased overflow-x-hidden`} 
        suppressHydrationWarning
      >
        <AuthProvider>
          <IdleTimer />
          {/* Removed overflow-x-hidden from here so sticky top-0 works properly */}
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
          <GlobalSupportWidget />
        </AuthProvider>
      </body>
    </html>
  );
}