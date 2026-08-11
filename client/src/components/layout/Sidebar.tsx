// client/src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/auth.store";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode | string;
  badge?: number; 
}

interface SidebarProps {
  navItems: NavItem[];
  portalLabel: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ navItems, portalLabel, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full w-64 shrink-0 flex-col bg-[#0A4A3A] text-white">
      {/* Brand & SVG Logo */}
      <div className="flex items-center gap-3 border-b border-[#196A54]/50 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F9F7] text-[#0A4A3A]">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4v16h16V4H4zm14 14H6V6h12v12zM8 8h2v8H8V8zm4 0h2v8h-2V8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-extrabold leading-tight tracking-wide">MECH SPEC</p>
          <p className="text-[10px] text-teal-100/60 font-semibold uppercase tracking-wider">Technologies LMS</p>
        </div>
      </div>

      {/* Portal label */}
      <div className="px-5 pt-6 pb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {portalLabel}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/student" || item.href === "/instructor" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#196A54] text-white shadow-md border-l-4 border-[#C2F25B]"
                  : "text-teal-100/70 hover:bg-[#196A54]/40 hover:text-white border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-5 w-5 items-center justify-center ${isActive ? "text-white" : "text-teal-100/50 group-hover:text-white transition-colors"}`}>
                  {item.icon}
                </span>
                {item.name}
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout at bottom */}
      <div className="mt-auto border-t border-[#196A54]/50 p-4">
        <button
          onClick={handleLogout}
          className="mb-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-teal-100/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
        
        <Link 
          href="/student/profile" 
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl bg-[#196A54]/30 px-3 py-3 border border-[#196A54]/40 cursor-pointer hover:bg-[#196A54]/50 transition-colors"
        >
          <Avatar name={user?.fullName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user?.fullName}</p>
            <p className="truncate text-[11px] font-medium text-teal-100/60">{user?.email}</p>
          </div>
          <svg className="w-4 h-4 text-teal-100/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex h-full border-r border-[#0A4A3A]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop blur */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          {/* Drawer Slide-in */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#0A4A3A] z-10 animate-in slide-in-from-left duration-300">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
              aria-label="Close sidebar"
            >
              ✕
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}