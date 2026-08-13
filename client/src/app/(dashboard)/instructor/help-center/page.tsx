"use client";

import { useEffect, useState } from "react";
import { BookOpen, Send, CheckCircle2, HelpCircle, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { HelpArticlesList } from "@/components/help/HelpArticlesList";
import type { SupportTicketSummary } from "@/types/support";

export default function InstructorHelpCenterPage() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<{
    status: string;
    messages: { body: string; isStaff: boolean; createdAt: string }[];
  } | null>(null);
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);

  const isTicketClosed =
    ticketDetail?.status === "CLOSED" || ticketDetail?.status === "RESOLVED";

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      try {
        const res = await api.get("/support/tickets/mine");
        if (!cancelled) setTickets(res.data.tickets ?? []);
      } catch { /* ignore */ }
    }

    void loadTickets();
    return () => { cancelled = true; };
  }, [submitted]);

  useEffect(() => {
    if (!selectedTicketId) return;
    let cancelled = false;

    async function loadDetail() {
      try {
        const res = await api.get(`/support/tickets/${selectedTicketId}`);
        if (!cancelled) setTicketDetail(res.data.ticket);
      } catch { /* ignore */ }
    }

    void loadDetail();
    return () => { cancelled = true; };
  }, [selectedTicketId]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/support/tickets", {
        subject: ticketSubject.trim(),
        body: ticketMessage.trim(),
      });
      setSubmitted(true);
      setTicketSubject("");
      setTicketMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicketId || !reply.trim() || isTicketClosed) return;
    setReplyError(null);
    try {
      await api.post(`/support/tickets/${selectedTicketId}/reply`, { body: reply.trim() });
      setReply("");
      const res = await api.get(`/support/tickets/${selectedTicketId}`);
      setTicketDetail(res.data.ticket);
      const listRes = await api.get("/support/tickets/mine");
      setTickets(listRes.data.tickets ?? []);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Unable to send reply.";
      setReplyError(message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10">
      <div className="bg-[#0A4A3A] rounded-2xl p-8 text-white shadow-lg">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-300">
          <HelpCircle className="w-3.5 h-3.5" /> Instructor Support
        </span>
        <h1 className="text-3xl font-extrabold mt-4">How can we help you?</h1>
        <p className="text-teal-100/80 text-sm mt-2">Browse help articles or message the admin team.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <HelpArticlesList embedded />

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" /> My Tickets
            </h3>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500">No support tickets yet.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(selectedTicketId === t.id ? null : t.id)}
                    className={`w-full text-left p-3 rounded-xl border text-sm ${
                      selectedTicketId === t.id ? "border-[#196A54] bg-emerald-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{t.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.status} · {new Date(t.updatedAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedTicketId && ticketDetail && (
              <div className="mt-4 border-t pt-4 space-y-3">
                {isTicketClosed && (
                  <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    This ticket is {ticketDetail.status.toLowerCase()}. You cannot reply unless an admin reopens it.
                  </p>
                )}
                {ticketDetail.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm ${m.isStaff ? "bg-blue-50 ml-4" : "bg-slate-50 mr-4"}`}
                  >
                    <p className="text-xs text-slate-500 mb-1">{m.isStaff ? "Admin" : "You"} · {new Date(m.createdAt).toLocaleString()}</p>
                    <p>{m.body}</p>
                  </div>
                ))}
                {!isTicketClosed && (
                  <div className="space-y-2">
                    {replyError && (
                      <p className="text-xs text-red-600">{replyError}</p>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Reply..."
                        className="flex-1 rounded-lg border px-3 py-2 text-sm"
                      />
                      <button
                        onClick={handleReply}
                        className="px-4 py-2 bg-[#196A54] text-white rounded-lg text-sm font-semibold"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6 space-y-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#196A54] mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900">Submit a Request</h3>
              <p className="text-xs text-slate-500">Contact platform administrators.</p>
            </div>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold">Ticket submitted!</p>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-xl border px-3 py-2.5 text-sm"
              />
              <textarea
                required
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Describe your issue..."
                className="w-full rounded-xl border p-3 text-sm resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0A4A3A] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-70"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Send Ticket"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
