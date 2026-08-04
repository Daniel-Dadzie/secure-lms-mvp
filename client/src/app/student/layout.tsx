"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const navigation = [
    { name: "My Learning", href: "/student", icon: "📚" },
    { name: "Certificates", href: "/student/certificates", icon: "🏆" },
    { name: "Purchase History", href: "/student/purchases", icon: "💳" },
    { name: "Settings", href: "/student/settings", icon: "⚙️" },
  ];

  const handleLogout = async () => {
    await logout();
    // Next.js will automatically redirect to home or login based on your protected routes
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* 
        Sidebar (Desktop) 
        Hidden on mobile, visible on medium screens and up 
      */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        {/* User Profile Snippet in Sidebar */}
        <div className="flex items-center gap-3 border-b border-slate-100 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {user?.fullName?.charAt(0) || "S"}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-slate-900">
              {user?.fullName || "Student"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || "student@example.com"}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button at the bottom */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <span className="text-lg">🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Mobile Header (Visible only on small screens) */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white p-4 md:hidden">
          <div className="font-bold text-slate-900">Student Portal</div>
          <button className="text-slate-500 hover:text-slate-900">
            {/* Simple hamburger icon */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        {/* The active page content gets injected here */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}