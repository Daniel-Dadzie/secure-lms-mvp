import { prisma } from "../../config/prisma";
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

async function loadFaqFromDb(): Promise<{ keywords: string[]; answer: string }[]> {
  try {
    const articles = await helpService.getPublishedHelpArticles();
    if (articles.length === 0) return FALLBACK_FAQ;
    return articles.map((a) => ({
      keywords: a.title.toLowerCase().split(/\s+/),
      answer: a.content,
    }));
  } catch {
    return FALLBACK_FAQ;
  }
}

function findAnswer(
  question: string,
  knowledgeBase: { keywords: string[]; answer: string }[]
): { answer: string; confidence: number } {
  const normalised = question.toLowerCase().trim();
  let bestMatch = { answer: "", confidence: 0, index: -1 };

  knowledgeBase.forEach((entry, i) => {
    const matchedKeywords = entry.keywords.filter((kw) => normalised.includes(kw));
    const confidence = matchedKeywords.length / entry.keywords.length;
    if (confidence > bestMatch.confidence) {
      bestMatch = { answer: entry.answer, confidence, index: i };
    }
  });

  if (bestMatch.confidence === 0 || bestMatch.index === -1) {
    return {
      answer:
        "I can only answer questions about platform features. Your question has been logged and an administrator will review it.",
      confidence: 0,
    };
  }

  return { answer: bestMatch.answer, confidence: bestMatch.confidence };
}

export async function askSupport(
  question: string,
  userId?: string
): Promise<{ answer: string; confidence: number; ticketId?: string }> {
  const knowledgeBase = await loadFaqFromDb();
  const result = findAnswer(question, knowledgeBase);

  const auditEvent = await prisma.auditEvent.create({
    data: {
      userId: userId || null,
      action: "support.question_asked",
      metadata: {
        question: question.substring(0, 500),
        confidence: result.confidence,
        answered: result.confidence > 0,
      },
    },
  });

  let ticketId: string | undefined;
  if (result.confidence === 0) {
    const ticket = await ticketsService.createTicket({
      userId,
      subject: question.substring(0, 100),
      body: question,
    });
    ticketId = ticket.id;
  }

  return { ...result, ticketId };
}
