"use client";

import { useState } from "react";
import { Search, BookOpen, MessageSquare, LifeBuoy, ChevronRight, Send, CheckCircle2, Mail, Phone, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    category: "Courses & Enrollment",
    question: "How do I start learning a course after enrolling?",
    answer: "Navigate to 'My Courses' from your dashboard sidebar, find your target course, and click 'Continue' to enter the immersive video classroom player."
  },
  {
    category: "Courses & Enrollment",
    question: "Why is my progress bar not updating to 100%?",
    answer: "Progress is calculated based on individual lesson completion. Ensure that every single lesson within all course modules has been marked or viewed as completed."
  },
  {
    category: "Certificates",
    question: "How can I download or share my completion certificate?",
    answer: "Go to the 'Certificates' section in your portal or dashboard menu. Click 'View' on any completed course to open the official verified credential, where you can download it as a PDF, print it, or share the secure link."
  },
  {
    category: "Account & Billing",
    question: "Can I access courses offline?",
    answer: "Currently, our platform requires an active internet connection to stream high-definition course modules and synchronize real-time learning progress."
  },
  {
    category: "Technical Support",
    question: "What should I do if course videos fail to load?",
    answer: "Verify your internet connection or try refreshing the page. If the issue persists, make sure your browser allows media playback or contact support below."
  }
];

export default function StudentHelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Ticket form state
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Technical Issue");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = ["All", "Courses & Enrollment", "Certificates", "Account & Billing", "Technical Support"];

  const filteredFaqs = FAQ_LIST.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      
      {/* HERO / SEARCH HEADER */}
      <div className="bg-[#0A4A3A] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <HelpCircle className="w-3.5 h-3.5" /> Student Support Desk
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">How can we help you today?</h1>
          <p className="text-teal-100/80 text-sm md:text-base">Search our knowledge base or submit a support ticket below.</p>
          
          <div className="relative pt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 mt-1 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers, courses, certificates..."
              className="w-full bg-white text-slate-900 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* QUICK STATS / CONTACT CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-[#0A4A3A] rounded-xl"><BookOpen className="w-6 h-6" /></div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Knowledge Base</h3>
            <p className="text-xs text-slate-500 mt-1">Explore guides, platform FAQs, and learning policies.</p>
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

      {/* FAQ SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
            
            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? "bg-[#0A4A3A] text-white shadow-sm" 
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500 text-sm">No matching questions found. Try a different search term or submit a ticket.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    {faq.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{faq.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SUBMIT SUPPORT TICKET FORM */}
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