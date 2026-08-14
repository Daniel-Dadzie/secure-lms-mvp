import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { retrieveRelevantArticles } from "../../lib/articleRetrieval";
import {
  formatRetrievalFallback,
  generateGroundedAnswer,
  GeminiRateLimitError,
  isChatbotEnabled,
} from "../../services/chatbot.service";
import * as helpService from "../help/help.service";
import * as ticketsService from "../admin/admin-tickets.service";

const FALLBACK_FAQ = [
  {
    keywords: ["register", "sign up", "create account", "new account"],
    answer:
      "To register, click the 'Create Account' button on the login page. Fill in your full name, email address, password (minimum 8 characters), and select your role (Student or Instructor).",
  },
  {
    keywords: ["login", "log in", "sign in", "access account"],
    answer:
      "To log in, go to the login page and enter your registered email and password.",
  },
  {
    keywords: ["enroll", "enrolment", "join course", "access course"],
    answer:
      "Browse the course catalogue, add a course to your cart, and complete checkout. Free courses can be enrolled in directly.",
  },
  {
    keywords: ["purchase", "buy", "payment", "checkout", "cart"],
    answer:
      "Add courses to your cart and proceed to checkout to complete your purchase.",
  },
  {
    keywords: ["certificate", "completion", "finish course"],
    answer:
      "Complete all lessons in a course to earn your certificate automatically.",
  },
  {
    keywords: ["contact", "support", "help", "issue", "problem"],
    answer:
      "For platform issues not covered here, please contact the platform administrator. Your question has been logged for review.",
  },
];

function getRetrievalThreshold(): number {
  const parsed = Number.parseFloat(process.env.CHATBOT_RETRIEVAL_THRESHOLD ?? "0.15");
  return Number.isFinite(parsed) ? parsed : 0.15;
}

function getSkipLlmThreshold(): number {
  const parsed = Number.parseFloat(process.env.CHATBOT_SKIP_LLM_THRESHOLD ?? "0.2");
  return Number.isFinite(parsed) ? parsed : 0.2;
}

function applyRetrievalAnswer(
  retrieved: ReturnType<typeof retrieveRelevantArticles>
): Pick<SupportAnswerResult, "answer" | "confidence" | "source" | "sourceTitles"> {
  return {
    answer: formatRetrievalFallback(retrieved.map((entry) => entry.article)),
    confidence: retrieved[0].score,
    source: "retrieval",
    sourceTitles: retrieved.map((entry) => entry.article.title),
  };
}

function findFallbackAnswer(
  question: string
): { answer: string; confidence: number } {
  const normalised = question.toLowerCase().trim();
  let bestMatch = { answer: "", confidence: 0 };

  for (const entry of FALLBACK_FAQ) {
    const matchedKeywords = entry.keywords.filter((kw) => normalised.includes(kw));
    const confidence = matchedKeywords.length / entry.keywords.length;
    if (confidence > bestMatch.confidence) {
      bestMatch = { answer: entry.answer, confidence };
    }
  }

  if (bestMatch.confidence === 0) {
    return {
      answer:
        "I can only answer questions about platform features. Your question has been logged and an administrator will review it.",
      confidence: 0,
    };
  }

  return bestMatch;
}

export interface SupportAnswerResult {
  answer: string;
  confidence: number;
  ticketId?: string;
  source?: "llm" | "retrieval" | "fallback";
  sourceTitles?: string[];
}

export async function askSupport(
  question: string,
  userId?: string
): Promise<SupportAnswerResult> {
  const threshold = getRetrievalThreshold();
  const skipLlmThreshold = getSkipLlmThreshold();
  const articles = await helpService.getPublishedHelpArticles();
  const retrieved = retrieveRelevantArticles(question, articles, 3);

  let answer: string;
  let confidence: number;
  let source: SupportAnswerResult["source"];
  let sourceTitles: string[] | undefined;
  let createTicket = false;

  if (articles.length === 0) {
    const fallback = findFallbackAnswer(question);
    answer = fallback.answer;
    confidence = fallback.confidence;
    source = "fallback";
    createTicket = fallback.confidence === 0;
  } else if (isChatbotEnabled()) {
    const contextArticles =
      retrieved.length > 0
        ? retrieved.map((entry) => entry.article)
        : articles.slice(0, 3);

    const strongMatch =
      retrieved.length > 0 && retrieved[0].score >= skipLlmThreshold;

    if (strongMatch) {
      ({ answer, confidence, source, sourceTitles } = applyRetrievalAnswer(retrieved));
    } else {
      try {
        const llmResult = await generateGroundedAnswer(question, contextArticles);

        if (llmResult.outOfScope) {
          createTicket = true;
          answer =
            "I can only answer questions covered in our help center. Your question has been logged and an administrator will review it.";
          confidence = retrieved[0]?.score ?? 0;
          source = "llm";
        } else {
          answer = llmResult.answer;
          confidence = Math.max(retrieved[0]?.score ?? 0.5, threshold);
          source = "llm";
          sourceTitles = contextArticles.map((article) => article.title);
        }
      } catch (error) {
        const isRateLimit = error instanceof GeminiRateLimitError;
        const detail =
          error instanceof Error
            ? error.message
            : "Unknown error while calling OpenRouter";

        if (isRateLimit) {
          console.warn("LLM quota exceeded — serving help article directly.", detail);
        } else {
          console.warn(
            "LLM help assistant unavailable — using retrieval fallback.",
            detail
          );
        }

        if (retrieved.length > 0) {
          ({ answer, confidence, source, sourceTitles } = applyRetrievalAnswer(retrieved));
        } else {
          createTicket = true;
          answer =
            "I could not find a matching help article. Your question has been logged for review.";
          confidence = 0;
          source = "retrieval";
        }
      }
    }
  } else if (retrieved.length > 0 && retrieved[0].score >= threshold) {
    answer = formatRetrievalFallback(retrieved.map((entry) => entry.article));
    confidence = retrieved[0].score;
    source = "retrieval";
    sourceTitles = retrieved.map((entry) => entry.article.title);
  } else {
    createTicket = true;
    answer =
      "I could not find a matching help article. Your question has been logged for review.";
    confidence = retrieved[0]?.score ?? 0;
    source = "retrieval";
  }

  const metadata: Prisma.InputJsonValue = {
    question: question.substring(0, 500),
    confidence,
    answered: !createTicket,
    source: source ?? "unknown",
    sourceTitles: sourceTitles ?? [],
  };

  await prisma.auditEvent.create({
    data: {
      userId: userId || null,
      action: "support.question_asked",
      metadata,
    },
  });

  let ticketId: string | undefined;
  if (createTicket) {
    const ticket = await ticketsService.createTicket({
      userId,
      subject: question.substring(0, 100),
      body: question,
    });
    ticketId = ticket.id;
  }

  return { answer, confidence, ticketId, source, sourceTitles };
}
