"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { ChatMessageContent } from "@/components/shared/ChatMessageContent";

interface HelpArticleChip {
  title: string;
}

interface SupportAnswer {
  answer: string;
  confidence?: number;
  source?: "llm" | "retrieval" | "fallback";
  sourceTitles?: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sourceTitles?: string[];
  isError?: boolean;
}

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
];

const WELCOME_MESSAGE =
  "Hi! I'm the MechSpec Help Assistant. Ask me anything about enrollment, payments, certificates, or using the platform.";

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: createMessageId(),
    role: "assistant",
    content: WELCOME_MESSAGE,
  };
}

export const FloatingFAQAssistant = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How do I reset my password?",
    "Payment methods",
    "Free courses",
    "Certificate access",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldHide = HIDDEN_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadSuggestions() {
      try {
        const res = await api.get("/help/articles");
        const articles = (res.data.articles ?? []) as HelpArticleChip[];
        if (!cancelled && articles.length > 0) {
          setSuggestions(
            articles.slice(0, 4).map((article) => article.title)
          );
        }
      } catch {
        // keep default chips
      }
    }

    void loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  function resetChat() {
    setMessages([]);
    setQuestion("");
    setIsLoading(false);
  }

  function closeChat() {
    resetChat();
    setIsOpen(false);
  }

  function openChat() {
    resetChat();
    setIsOpen(true);
    setMessages([createWelcomeMessage()]);
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (shouldHide) {
    return null;
  }

  async function sendQuestion(rawQuestion: string) {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const res = await api.post<SupportAnswer>("/support/ask", {
        question: trimmed,
      });

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: res.data.answer,
        sourceTitles: res.data.sourceTitles,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content:
            err?.response?.data?.message ||
            "Could not reach Help Assistant. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  const handleAskQuestion = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendQuestion(question);
  };

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[min(32rem,70vh)] w-80 sm:w-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Help Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Powered by help center articles
              </p>
            </div>
            <button
              onClick={closeChat}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 font-bold text-sm transition-colors"
              aria-label="Close Help Assistant"
            >
              ✕
            </button>
          </div>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-[#0A4A3A] text-white"
                      : message.isError
                        ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                        : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-line">{message.content}</p>
                  ) : (
                    <ChatMessageContent
                      content={message.content}
                      variant={message.isError ? "error" : "assistant"}
                    />
                  )}
                  {message.role === "assistant" &&
                    !message.isError &&
                    message.sourceTitles &&
                    message.sourceTitles.length > 0 && (
                      <p className="mt-2 text-[10px] text-slate-500">
                        Based on: {message.sourceTitles.join(", ")}
                      </p>
                    )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (empty / first message only) */}
          {showSuggestions && (
            <div className="shrink-0 border-t border-slate-100 px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Try asking
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {suggestions.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => void sendQuestion(sample)}
                    disabled={isLoading}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#0A4A3A] hover:text-[#0A4A3A] transition-colors disabled:opacity-50"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input pinned to bottom */}
          <form
            onSubmit={handleAskQuestion}
            className="shrink-0 border-t border-slate-200 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A4A3A] text-white transition hover:bg-[#12503F] disabled:opacity-50"
                aria-label="Send message"
              >
                <svg className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => (isOpen ? closeChat() : openChat())}
          aria-label={isOpen ? "Close Help Assistant" : "Open Help Assistant"}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A4A3A] text-white shadow-2xl hover:bg-[#12503F] transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A] focus:ring-offset-2"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>

        {!isOpen && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4F9F7]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C2F25B]" />
          </span>
        )}
      </div>
    </div>
  );
};
