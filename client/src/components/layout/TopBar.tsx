"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/auth.store";
import { Bell, Check, CheckCheck, Clock, ExternalLink } from "lucide-react";
import api from "@/lib/api";

interface TopBarProps {
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
  onOpenMobileSidebar?: () => void;
  profileHref?: string;
  notificationsHref?: string;
  helpHref?: string;
  searchPlaceholder?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function TopBar({
  title,
  breadcrumb,
  onOpenMobileSidebar,
  profileHref = "/student/profile",
  notificationsHref = "/student/notifications",
  helpHref = "/student/help-center",
  searchPlaceholder = "Search courses...",
}: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore() as { user: any; logout: () => void };
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Notification Dropdown States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications for the dropdown
const fetchNotifications = async () => {
    try {
    
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
       // Silently catch if unauthenticated; no need for loading state in a dropdown
    }
  };

useEffect(() => {
    // Define the async function inside the effect
    const loadData = async () => {
      try {
        const res = await api.get("/notifications?limit=5");
        // These calls are fine here because they are inside an async flow
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    loadData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-sm">
      
      {/* Left — Hamburger Trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
          aria-label="Open mobile navigation menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden md:flex flex-col flex-shrink-0 mr-8">
          {title && (
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{title}</h1>
          )}
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1 text-xs font-medium text-slate-400 mt-0.5">
              {breadcrumb.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-[#196A54] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Right Content Wrapper */}
      <div className="flex flex-1 items-center justify-end gap-6">
        <form onSubmit={handleSearch} className="w-full max-w-[320px] hidden sm:block">
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#196A54] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search courses"
              className="w-full rounded-lg bg-[#F4F9F7] pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 border-none focus:outline-none focus:ring-2 focus:ring-[#196A54]/30 focus:bg-white transition-all"
            />
          </div>
        </form>

        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

        <div className="flex items-center gap-4">
          
          {/* INTERACTIVE NOTIFICATION BELL & DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-30 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                
                {/* Dropdown Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-bold text-[#196A54] hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Dropdown Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-medium">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 transition-colors flex items-start gap-3 ${
                          notif.isRead ? "bg-white text-slate-600" : "bg-emerald-50/40 text-slate-900 font-semibold"
                        }`}
                      >
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            title="Mark as read"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all shrink-0 self-center"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Dropdown Footer Link */}
                <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
                  <Link
                    href={notificationsHref}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-[#196A54] hover:underline flex items-center justify-center gap-1.5 py-1"
                  >
                    View all notifications <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            )}
          </div>

          {/* Avatar + Profile Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu((s) => !s)}
              className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
              aria-label="Profile menu"
            >
              <div className="ring-2 ring-white shadow-sm rounded-full">
                <Avatar name={user?.fullName} size="sm" />
              </div>
              <span className="hidden text-sm font-bold text-slate-700 sm:block">
                {user?.fullName?.split(" ")[0] || "Student"}
              </span>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg ring-1 ring-black/5">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={profileHref}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#196A54] transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      href={helpHref}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#196A54] transition-colors"
                    >
                      Help Center
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}   
