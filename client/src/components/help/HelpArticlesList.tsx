"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, HelpCircle } from "lucide-react";
import api from "@/lib/api";
import type { HelpArticle } from "@/types/admin";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FALLBACK_FAQ: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I register for an account?",
    answer:
      "Click Create Account on the login page, fill in your details, and verify your email.",
  },
  {
    category: "Courses & Enrollment",
    question: "How do I enroll in a course?",
    answer:
      "Browse the course catalogue, add a course to your cart, and complete checkout. Free courses can be enrolled in directly.",
  },
];

function mapArticlesToFaq(articles: HelpArticle[]): FAQItem[] {
  return articles.map((a) => ({
    question: a.title,
    answer: a.content,
    category: a.category,
  }));
}

interface HelpArticlesListProps {
  showLoginHint?: boolean;
  embedded?: boolean;
}

export function HelpArticlesList({ showLoginHint = false, embedded = false }: HelpArticlesListProps) {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    api
      .get("/help/articles")
      .then((res) => setArticles(res.data.articles ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const faqList = useMemo(() => {
    const mapped = mapArticlesToFaq(articles);
    return mapped.length > 0 ? mapped : FALLBACK_FAQ;
  }, [articles]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(faqList.map((f) => f.category)))],
    [faqList]
  );

  const filteredFaqs = faqList.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {!embedded && (
        <div className="bg-[#0A4A3A] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
              <HelpCircle className="w-3.5 h-3.5" /> Help Center
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">How can we help you?</h1>
            <p className="text-teal-100/80 text-sm md:text-base">
              Search our knowledge base for answers about courses, billing, and platform features.
            </p>
            <div className="relative pt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 mt-1 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles..."
                className="w-full bg-white text-slate-900 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      )}

      {embedded && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      )}

      {showLoginHint && (
        <p className="text-sm text-slate-600">
          Need to submit a support ticket?{" "}
          <Link href="/login" className="font-semibold text-[#196A54] hover:underline">
            Log in
          </Link>{" "}
          and visit the Help Center from your student dashboard.
        </p>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Help Articles</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
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

        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
            Loading help articles...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <p className="text-slate-500 text-sm">No matching articles found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={`${faq.question}-${index}`}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  {faq.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{faq.question}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
