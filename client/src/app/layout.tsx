import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure LMS MVP",
  description: "Learning Management Platform MVP for Mech Spec Technologies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}