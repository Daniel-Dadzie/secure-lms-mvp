import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios, { AxiosError } from "axios";
import {
  formatRetrievalFallback,
  generateGroundedAnswer,
  ChatbotRateLimitError,
  isChatbotEnabled,
  OUT_OF_SCOPE_MARKER,
} from "../../src/services/chatbot.service";
import {
  clearChatbotResponseCache,
  getCachedChatbotResult,
  buildResponseCacheKey,
} from "../../src/lib/chatbotCache";

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
    AxiosError: actual.AxiosError,
  };
});

function mockOpenRouterResponse(content: string) {
  return {
    data: {
      choices: [{ message: { content } }],
    },
  };
}

describe("chatbot.service", () => {
  const envSnapshot = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    CHATBOT_LLM_ENABLED: process.env.CHATBOT_LLM_ENABLED,
  };

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.CHATBOT_LLM_ENABLED = "true";
    process.env.CHATBOT_RESPONSE_CACHE_ENABLED = "false";
    vi.mocked(axios.post).mockReset();
    clearChatbotResponseCache();
  });

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = envSnapshot.OPENROUTER_API_KEY;
    process.env.CHATBOT_LLM_ENABLED = envSnapshot.CHATBOT_LLM_ENABLED;
  });

  it("is disabled without API key", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(isChatbotEnabled()).toBe(false);
  });

  it("returns natural answer from OpenRouter response", async () => {
    vi.mocked(axios.post).mockResolvedValue(
      mockOpenRouterResponse("You can reset your password from the login page.")
    );

    const result = await generateGroundedAnswer("forgot password", [
      {
        title: "How to Reset Your Password",
        category: "account",
        content: "Use Forgot Password on the login page.",
      },
    ]);

    expect(result.outOfScope).toBe(false);
    expect(result.answer).toContain("reset your password");
    expect(axios.post).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        model: expect.any(String),
        session_id: "mechspec-help-assistant",
        reasoning: { effort: "low", exclude: true },
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ role: "user" }),
        ]),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "x-session-id": "mechspec-help-assistant",
        }),
      })
    );
  });

  it("returns cached answer without calling OpenRouter again", async () => {
    process.env.CHATBOT_RESPONSE_CACHE_ENABLED = "true";

    vi.mocked(axios.post).mockResolvedValue(
      mockOpenRouterResponse("Browse courses and checkout to enroll.")
    );

    const articles = [
      {
        title: "How to Enroll",
        category: "courses",
        content: "Browse courses and checkout.",
      },
    ];

    const first = await generateGroundedAnswer("how to enroll", articles);
    const second = await generateGroundedAnswer("how to enroll", articles);

    expect(first.fromCache).toBeFalsy();
    expect(second.fromCache).toBe(true);
    expect(second.answer).toBe(first.answer);
    expect(axios.post).toHaveBeenCalledTimes(1);

    const cacheKey = buildResponseCacheKey("how to enroll", articles);
    expect(getCachedChatbotResult(cacheKey)?.answer).toBe(first.answer);
  });

  it("tries the next model when the configured model returns 404", async () => {
    const notFoundError = new AxiosError(
      "Request failed with status code 404",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {} as never,
        data: { error: { message: "Model not found" } },
      }
    );

    vi.mocked(axios.post)
      .mockRejectedValueOnce(notFoundError)
      .mockResolvedValueOnce(
        mockOpenRouterResponse("Browse courses and checkout to enroll.")
      );

    const result = await generateGroundedAnswer("how to enroll", [
      {
        title: "How to Enroll",
        category: "courses",
        content: "Browse courses and checkout.",
      },
    ]);

    expect(result.outOfScope).toBe(false);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it("throws ChatbotRateLimitError when all models are rate limited", async () => {
    vi.useFakeTimers();

    const rateLimitError = new AxiosError(
      "Request failed with status code 429",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 429,
        statusText: "Too Many Requests",
        headers: {},
        config: {} as never,
        data: { error: { message: "Quota exceeded" } },
      }
    );

    vi.mocked(axios.post).mockRejectedValue(rateLimitError);

    const promise = generateGroundedAnswer("how to enroll", [
      {
        title: "How to Enroll",
        category: "courses",
        content: "Browse courses and checkout.",
      },
    ]);

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toBeInstanceOf(ChatbotRateLimitError);

    vi.useRealTimers();
  });

  it("treats OUT_OF_SCOPE marker as out of scope", async () => {
    vi.mocked(axios.post).mockResolvedValue(
      mockOpenRouterResponse(OUT_OF_SCOPE_MARKER)
    );

    const result = await generateGroundedAnswer("weather today", [
      {
        title: "How to Enroll",
        category: "courses",
        content: "Browse courses.",
      },
    ]);

    expect(result.outOfScope).toBe(true);
  });

  it("formats retrieval fallback with article title", () => {
    const text = formatRetrievalFallback([
      {
        title: "How to Enroll",
        category: "courses",
        content: "Browse the catalogue.",
      },
    ]);

    expect(text).toContain("How to Enroll");
    expect(text).toContain("Browse the catalogue.");
  });
});
