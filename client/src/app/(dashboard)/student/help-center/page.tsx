"use client";

import { useState } from "react";
import { BookOpen, Send, CheckCircle2, Mail, Phone, HelpCircle } from "lucide-react";
import { HelpArticlesList } from "@/components/help/HelpArticlesList";

export default function StudentHelpCenterPage() {
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Technical Issue");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTicketSubject("");
      setTicketMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10">
      <div className="bg-[#0A4A3A] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <HelpCircle className="w-3.5 h-3.5" /> Student Support Desk
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">How can we help you today?</h1>
          <p className="text-teal-100/80 text-sm md:text-base">
            Search published help articles or submit a support ticket below.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-[#0A4A3A] rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Knowledge Base</h3>
            <p className="text-xs text-slate-500 mt-1">Articles managed by admins and shown below.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Mail className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Email Support</h3>
            <p className="text-xs text-slate-500 mt-1">support@mechspec.test — 24h response time.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Phone className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Direct Line</h3>
            <p className="text-xs text-slate-500 mt-1">+233 (0) 30 200 0000 Mon–Fri</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HelpArticlesList embedded />
        </div>

        <div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Submit a Request</h3>
              <p className="text-xs text-slate-500 mt-0.5">Can&apos;t find what you need? Send our team a message.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Ticket Submitted Successfully!</h4>
                <p className="text-xs text-slate-600">We&apos;ve received your request and will get back to your registered email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Technical Issue">Technical / Video Playback</option>
                    <option value="Billing">Billing & Subscription</option>
                    <option value="Certificate">Certificate Verification</option>
                    <option value="Other">General Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#0A4A3A] hover:bg-[#12503F] text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Submitting..." : "Send Support Ticket"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
