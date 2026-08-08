"use client";

import { useState, FormEvent } from "react";
import PageHero from "@/components/shared/PageHero";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

const faqs = [
  {
    question: "How do I enrol in a course?",
    answer: "You can enrol in any course by clicking the 'Enroll' button on the course card or catalogue. If it's a paid course, you will be guided through checkout; free courses give you instant access."
  },
  {
    question: "Are certificates recognised by employers?",
    answer: "Yes, all our professional certificates are WCQA-accredited and recognised by leading engineering firms globally, including Boeing, Tesla, Siemens, and Lockheed Martin."
  },
  {
    question: "Can I access courses on mobile?",
    answer: "Yes! Our platform is a fully responsive Progressive Web App (PWA). You can learn seamlessly on mobile, tablet, or desktop, with offline access support included."
  },
  {
    question: "What is your refund policy?",
    answer: "We offer a 30-day money-back guarantee on all paid individual courses if you are not fully satisfied with your technical learning experience."
  },
  {
    question: "How do I become an instructor?",
    answer: "If you are an experienced engineer with 10+ years in the industry, you can apply by clicking 'Register' and selecting 'Instructor' during account creation, or reach out to our partnerships team."
  }
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Hero Section */}
      <PageHero
        badge="Get in Touch"
        title="Contact Mech Spec Technologies"
        subtitle="Have a question, partnership enquiry, or need technical support? We're here to help."
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-20">
        {/* 2. Main Grid: Form (Left) & Info Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left: Send Us a Message Form (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm">
            {isSubmitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Sent Successfully!</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Thank you for reaching out. Our support team will review your inquiry and get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setName("");
                    setEmail("");
                    setSubject("General Inquiry");
                    setMessage("");
                  }}
                  className="mt-4 inline-flex items-center justify-center bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-sm"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Send Us a Message</h3>
                  <p className="text-sm text-slate-500">Fill out the form below and our team will respond shortly.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4A3A] focus:ring-1 focus:ring-[#0A4A3A] transition bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4A3A] focus:ring-1 focus:ring-[#0A4A3A] transition bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="subject">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#0A4A3A] focus:ring-1 focus:ring-[#0A4A3A] transition bg-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Partnership Enquiry">Partnership Enquiry</option>
                    <option value="Billing & Payments">Billing & Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0A4A3A] focus:ring-1 focus:ring-[#0A4A3A] transition bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#0A4A3A] hover:bg-[#12503F] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm"
                >
                  <span>{isSubmitting ? "Sending Message..." : "Send Message →"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Contact Information Cards & Follow Us */}
          <div className="space-y-6">
            {/* Email Us */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-sm flex items-start space-x-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Mail className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm">Email Us</h4>
                <p className="text-xs text-slate-600 font-medium">support@mechspec.com</p>
                <p className="text-xs text-slate-500">partnerships@mechspec.com</p>
              </div>
            </div>

            {/* Call Us */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Phone className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm">Call Us</h4>
                <p className="text-xs text-slate-600 font-medium">+1 (800) 555-0123</p>
                <p className="text-xs text-slate-500">Mon–Fri, 9am–6pm EST</p>
              </div>
            </div>

            {/* Head Office */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <MapPin className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm">Head Office</h4>
                <p className="text-xs text-slate-600 font-medium">350 Fifth Avenue, Suite 2400</p>
                <p className="text-xs text-slate-500">New York, NY 10118, USA</p>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start space-x-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Clock className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 text-sm">Support Hours</h4>
                <p className="text-xs text-slate-600 font-medium">Live chat: 24/7</p>
                <p className="text-xs text-slate-500">Phone: Mon–Fri 9am–6pm EST</p>
              </div>
            </div>

            {/* Follow Us with Brand-Specific Hover Colors */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Follow Us</h4>
              <div className="flex items-center gap-3">
                {/* Portfolio / Globe (Brand Green) */}
                <a href="#" aria-label="Website" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-[#0A4A3A] hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 transition-transform duration-300 hover:scale-110" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
                {/* Twitter / X (Black background) */}
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-black hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* YouTube (Red background) */}
                <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-red-600 hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                {/* Facebook (Blue background) */}
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                {/* LinkedIn (Professional Blue background) */}
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-blue-700 hover:text-white border border-slate-200 flex items-center justify-center text-slate-600 transition-all duration-300 hover:scale-105">
                  <svg className="w-4 h-4 transition-transform duration-300 hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.729C24 .774 23.205 0 22.225 0z"/></svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Frequently Asked Questions (FAQ) Section */}
        <div className="space-y-8 pt-10 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0A4A3A]">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:border-emerald-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-base text-slate-900">{faq.question}</span>
                    <span className="text-[#0A4A3A] shrink-0">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}