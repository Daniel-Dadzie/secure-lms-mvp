"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Check, Star, Users, Info, Clock, MessageSquare } from "lucide-react";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function InstructorNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "reviews" | "enrollments">("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get("/notifications");
        if (!cancelled) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "reviews") return n.type === "NEW_REVIEW";
    if (filter === "enrollments") return n.type === "NEW_ENROLLMENT";
    return true;
  });

  const getIcon = (type: string) => {
    if (type === "NEW_REVIEW") return <Star className="w-5 h-5 text-amber-500" />;
    if (type === "NEW_ENROLLMENT") return <Users className="w-5 h-5 text-emerald-600" />;
    if (type.startsWith("SUPPORT_TICKET")) return <MessageSquare className="w-5 h-5 text-blue-600" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#196A54]" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Reviews, enrollments, and platform updates.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "unread", "reviews", "enrollments"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize ${
              filter === f ? "bg-[#196A54] text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center py-12 text-slate-400 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-slate-500 text-sm">No notifications.</p>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border flex items-start gap-4 ${
                notif.isRead ? "bg-white border-slate-200" : "bg-emerald-50/40 border-emerald-200"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">{notif.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3" />
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              {!notif.isRead && (
                <button onClick={() => handleMarkAsRead(notif.id)} className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-lg">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
