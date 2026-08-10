// src/components/shared/FloatingFAQAssistant.tsx
"use client";

import { useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

interface SupportAnswer {
  answer: string;
  confidence?: number;
}

// 1. Define routes where the floating modal should NEVER render
const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/admin",
  "/instructor",
  "/support",
];

export const FloatingFAQAssistant = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SupportAnswer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. Technical Guard: If current route matches a hidden prefix, render nothing (null)
  const shouldHide = HIDDEN_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  if (shouldHide) {
    return null;
  }

  const handleAskQuestion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await api.post("/support/ask", {
        question: question.trim(),
      });
      setResult(res.data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Could not reach FAQ Assistant. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Modal Popover Card */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                FAQ Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Instant help center keyword lookup
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold text-sm transition-colors"
              aria-label="Close FAQ Assistant"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAskQuestion} className="mt-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask e.g., How do free courses work?"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="rounded-lg bg-[#0A4A3A] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#12503F] disabled:opacity-50 shrink-0"
              >
                {isLoading ? "..." : "Ask"}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  Answer
                </span>
                {result.confidence !== undefined && (
                  <span className="text-[10px] text-slate-400">
                    {Math.round(result.confidence * 100)}% match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {result.answer}
              </p>
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Common Questions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Reset password",
                "Payment methods",
                "Free courses",
                "Certificate access",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setQuestion(sample)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#0A4A3A] hover:text-[#0A4A3A] transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Branded Trigger Button (Replaces the black '?') */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close FAQ Assistant" : "Open FAQ Assistant"}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A4A3A] text-white shadow-2xl hover:bg-[#12503F] transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:ring-offset-2"
        >
          {isOpen ? (
            /* X Icon when open */
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Message Icon when closed */
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
        
        {/* Lime Green Online Indicator (Hides when chat is open) */}
        {!isOpen && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4F9F7]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C2F25B]"></span>
          </span>
        )}
      </div>
    </div>
  );
};