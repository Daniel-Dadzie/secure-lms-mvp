import { describe, it, expect, beforeEach } from "vitest";
import {
  buildArticlesFingerprint,
  buildResponseCacheKey,
  clearChatbotResponseCache,
  getCachedChatbotResult,
  normalizeQuestion,
  setCachedChatbotResult,
} from "../../src/lib/chatbotCache";

describe("chatbotCache", () => {
  beforeEach(() => {
    clearChatbotResponseCache();
  });

  it("normalises questions for cache keys", () => {
    expect(normalizeQuestion("  How   Do I Register? ")).toBe("how do i register?");
  });

  it("stores and retrieves cached answers", () => {
    const articles = [
      {
        title: "Register",
        category: "account",
        content: "Click Create Account.",
      },
    ];
    const key = buildResponseCacheKey("How do I register?", articles);

    setCachedChatbotResult(key, {
      answer: "Click Create Account.",
      outOfScope: false,
      modelUsed: "test-model",
    });

    expect(getCachedChatbotResult(key)).toEqual({
      answer: "Click Create Account.",
      outOfScope: false,
      modelUsed: "test-model",
    });
  });

  it("changes fingerprint when article content changes", () => {
    const base = [
      {
        title: "Register",
        category: "account",
        content: "Click Create Account.",
      },
    ];
    const updated = [
      {
        title: "Register",
        category: "account",
        content: "Use the sign-up form.",
      },
    ];

    expect(buildArticlesFingerprint(base)).not.toBe(buildArticlesFingerprint(updated));
  });
});
