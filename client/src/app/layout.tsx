import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import { GlobalSupportWidget } from "@/components/layout/GlobalSupportWidget";

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
    <html lang="en" suppressHydrationWarning >
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <GlobalSupportWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

