import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";

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
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          {/* We removed ConditionalLayout. The layouts in your (public) and (auth) folders will now handle the Navbars natively! */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}