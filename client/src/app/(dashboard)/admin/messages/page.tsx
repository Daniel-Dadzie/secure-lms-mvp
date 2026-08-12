"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatRelativeTime } from "@/lib/admin/formatters";
import type { SupportMessage, SupportTicket } from "@/types/admin";

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<"tickets" | "faq">("tickets");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    const res = await api.get("/admin/tickets?limit=50");
    setTickets(res.data.tickets ?? []);
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await api.get("/admin/messages?answered=false&limit=50");
    setMessages(res.data.messages ?? []);
  }, []);

  useEffect(() => {
    Promise.all([fetchTickets(), fetchMessages()]).finally(() => setLoading(false));
  }, [fetchTickets, fetchMessages]);

  async function loadTicketDetail(ticketId: string) {
    const res = await api.get(`/admin/tickets/${ticketId}`);
    setSelectedTicket(res.data.ticket);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/admin/tickets/${selectedTicket.id}/reply`, { body: reply });
      setReply("");
      await loadTicketDetail(selectedTicket.id);
      await fetchTickets();
    } finally {
      setSubmitting(false);
    }
  }

  async function resolveFaqMessage(eventId: string) {
    await api.patch(`/admin/messages/${eventId}/resolve`);
    await fetchMessages();
  }

  async function updateTicketStatus(ticketId: string, status: string) {
    await api.patch(`/admin/tickets/${ticketId}`, { status });
    await fetchTickets();
    if (selectedTicket?.id === ticketId) await loadTicketDetail(ticketId);
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Messages</h1>
        <p className="text-sm text-slate-500 mt-1">Support tickets and FAQ escalations.</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("tickets")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === "tickets" ? "bg-[#0A4A3A] text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          Tickets ({tickets.filter((t) => t.status !== "CLOSED" && t.status !== "RESOLVED").length})
        </button>
        <button
          onClick={() => setTab("faq")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === "faq" ? "bg-[#0A4A3A] text-white" : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          FAQ Escalations ({messages.length})
        </button>
      </div>

      {tab === "tickets" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 divide-y max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No tickets yet.</p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => loadTicketDetail(ticket.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 ${
                    selectedTicket?.id === ticket.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-900 truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ticket.user?.fullName ?? "Anonymous"} · {formatRelativeTime(ticket.createdAt)}
                  </p>
                  <Badge variant={ticket.status === "OPEN" ? "amber" : "green"} className="mt-2">
                    {ticket.status}
                  </Badge>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 min-h-[400px]">
            {!selectedTicket ? (
              <p className="text-sm text-slate-500">Select a ticket to view the conversation.</p>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">{selectedTicket.subject}</h2>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                  >
                    {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-80 mb-4">
                  {selectedTicket.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-sm ${
                        msg.isStaff ? "bg-[#F4F9F7] ml-8" : "bg-slate-100 mr-8"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        {msg.isStaff ? "Admin" : msg.sender?.fullName ?? "User"}
                      </p>
                      <p className="text-slate-800">{msg.body}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <Button type="submit" className="bg-[#0A4A3A]" isLoading={submitting}>
                    Send
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "faq" && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y">
          {messages.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No unanswered FAQ escalations.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="p-4 flex justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {(msg.metadata as { question?: string })?.question ?? "Support question"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {msg.user?.fullName ?? "Anonymous"} · {formatRelativeTime(msg.createdAt)}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => resolveFaqMessage(msg.id)}>
                  Resolve
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
