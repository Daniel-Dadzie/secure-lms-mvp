import { describe, it, expect, vi, afterEach } from "vitest";
import { prisma } from "../../src/config/prisma";

const chatbotMocks = vi.hoisted(() => ({
  isChatbotEnabled: vi.fn(),
  generateGroundedAnswer: vi.fn(),
  formatRetrievalFallback: vi.fn(
    (articles: { title: string; content: string }[]) =>
      articles.length > 0
        ? `From our help center (${articles[0].title}):\n\n${articles[0].content}`
        : "I could not find a matching help article. Your question has been logged for review."
  ),
}));

vi.mock("../../src/services/chatbot.service", () => ({
  isChatbotEnabled: chatbotMocks.isChatbotEnabled,
  generateGroundedAnswer: chatbotMocks.generateGroundedAnswer,
  formatRetrievalFallback: chatbotMocks.formatRetrievalFallback,
  OUT_OF_SCOPE_MARKER: "OUT_OF_SCOPE",
}));

import { askSupport } from "../../src/modules/support/support.service";

describe("askSupport hybrid flow", () => {
  const articleIds: string[] = [];
  const ticketIds: string[] = [];

  afterEach(async () => {
    vi.clearAllMocks();

    for (const ticketId of ticketIds.splice(0)) {
      await prisma.supportMessage.deleteMany({ where: { ticketId } }).catch(() => {});
      await prisma.supportTicket.delete({ where: { id: ticketId } }).catch(() => {});
    }

    for (const articleId of articleIds.splice(0)) {
      await prisma.helpArticle.delete({ where: { id: articleId } }).catch(() => {});
    }

    await prisma.auditEvent.deleteMany({
      where: { action: "support.question_asked" },
    });
  });

  it("uses retrieval fallback when LLM is disabled", async () => {
    chatbotMocks.isChatbotEnabled.mockReturnValue(false);

    const article = await prisma.helpArticle.create({
      data: {
        title: "How to Reset Your Password",
        slug: "how-to-reset-password-test",
        content: "Click Forgot Password on the login page and follow the email link.",
        category: "account",
        isPublished: true,
        order: 1,
      },
    });
    articleIds.push(article.id);

    const result = await askSupport("I forgot my password");

    expect(result.source).toBe("retrieval");
    expect(result.answer).toContain("Forgot Password");
    expect(result.ticketId).toBeUndefined();
  });

  it("creates a ticket for out-of-scope LLM responses", async () => {
    chatbotMocks.isChatbotEnabled.mockReturnValue(true);
    chatbotMocks.generateGroundedAnswer.mockResolvedValue({
      answer: "",
      outOfScope: true,
    });

    const article = await prisma.helpArticle.create({
      data: {
        title: "How to Enroll in a Course",
        slug: "how-to-enroll-test",
        content: "Browse courses and checkout.",
        category: "courses",
        isPublished: true,
        order: 1,
      },
    });
    articleIds.push(article.id);

    const result = await askSupport("What is the weather today?");

    expect(result.ticketId).toBeDefined();
    if (result.ticketId) ticketIds.push(result.ticketId);
    expect(result.answer).toContain("help center");
  });
});
