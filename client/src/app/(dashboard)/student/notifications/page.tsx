"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Check, Info, AlertCircle, Award, BookOpen, Clock, MessageSquare } from "lucide-react";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");



useEffect(() => {
    // Define the async function inside the effect
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/notifications");
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []); // Empty array ensures it only runs on mount

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "COURSE":
      case "ENROLMENT":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case "ACHIEVEMENT":
      case "CERTIFICATE":
        return <Award className="w-5 h-5 text-amber-500" />;
      case "ALERT":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        if (type.startsWith("SUPPORT_TICKET")) {
          return <MessageSquare className="w-5 h-5 text-blue-600" />;
        }
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#196A54]" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated with your coursework, achievements, and system messages.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "all"
              ? "bg-[#196A54] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "unread"
              ? "bg-[#196A54] text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 font-medium text-sm">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No notifications found</p>
            <p className="text-xs text-slate-400">You&apos;re all caught up! Check back later for updates.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-sm ${
                notif.isRead
                  ? "bg-white border-slate-200 text-slate-600"
                  : "bg-emerald-50/40 border-emerald-200 text-slate-900"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                {getIconForType(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`font-bold text-sm truncate ${notif.isRead ? "text-slate-800" : "text-slate-900 font-extrabold"}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  title="Mark as read"
                  className="p-2 text-emerald-700 hover:bg-emerald-100/60 rounded-lg transition-all shrink-0 self-center"
                >
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