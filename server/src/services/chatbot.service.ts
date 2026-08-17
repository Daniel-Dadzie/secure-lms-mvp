import axios, { isAxiosError } from "axios";
import {
  buildResponseCacheKey,
  getCachedChatbotResult,
  isResponseCacheEnabled,
  setCachedChatbotResult,
  type ChatArticleContext,
} from "../lib/chatbotCache";

export const OUT_OF_SCOPE_MARKER = "OUT_OF_SCOPE";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const HELP_ASSISTANT_SESSION_ID = "mechspec-help-assistant";

/** Free models on OpenRouter — tried in order on failure. */
const DEFAULT_MODELS = [
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-3-4b:free",
];

export type { ChatArticleContext };

export class ChatbotRateLimitError extends Error {
  constructor(message = "LLM API rate limit exceeded") {
    super(message);
    this.name = "ChatbotRateLimitError";
  }
}

/** @deprecated Use ChatbotRateLimitError */
export const GeminiRateLimitError = ChatbotRateLimitError;

export function isChatbotEnabled(): boolean {
  return (
    process.env.CHATBOT_LLM_ENABLED !== "false" &&
    Boolean(process.env.OPENROUTER_API_KEY?.trim())
  );
}

function isPromptCacheEnabled(): boolean {
  return process.env.CHATBOT_PROMPT_CACHE_ENABLED !== "false";
}

function getModelCandidates(): string[] {
  const configured = process.env.OPENROUTER_MODEL?.trim();
  if (!configured) return DEFAULT_MODELS;
  return [configured, ...DEFAULT_MODELS.filter((model) => model !== configured)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatArticles(articles: ChatArticleContext[]): string {
  return articles
    .map(
      (article, index) =>
        `[Article ${index + 1}]\nTitle: ${article.title}\nCategory: ${article.category}\nContent:\n${article.content}`
    )
    .join("\n\n---\n\n");
}

interface OpenRouterMessage {
  content?: string | null;
  reasoning?: string | null;
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: OpenRouterMessage;
  }>;
  usage?: {
    prompt_tokens_details?: {
      cached_tokens?: number;
    };
  };
}

interface OpenRouterErrorBody {
  error?: {
    message?: string;
    code?: number | string;
  };
}

function buildHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const referer = process.env.CLIENT_URL?.trim() || "http://localhost:3000";
  headers["HTTP-Referer"] = referer;
  headers["X-Title"] = "MechSpec LMS Help Assistant";
  headers["x-session-id"] = HELP_ASSISTANT_SESSION_ID;

  return headers;
}

function buildUserMessage(question: string, articles: ChatArticleContext[]) {
  const articlesBlock = `HELP ARTICLES:\n${formatArticles(articles)}`;
  const questionBlock = `QUESTION: ${question}`;

  if (!isPromptCacheEnabled()) {
    return {
      role: "user" as const,
      content: `${articlesBlock}\n\n${questionBlock}`,
    };
  }

  return {
    role: "user" as const,
    content: [
      {
        type: "text",
        text: articlesBlock,
        cache_control: {
          type: "ephemeral",
          ttl: "1h",
        },
      },
      {
        type: "text",
        text: questionBlock,
      },
    ],
  };
}

async function callOpenRouterModel(
  modelName: string,
  apiKey: string,
  systemInstruction: string,
  question: string,
  articles: ChatArticleContext[]
): Promise<OpenRouterChatResponse> {
  const { data } = await axios.post<OpenRouterChatResponse>(
    OPENROUTER_API_URL,
    {
      model: modelName,
      session_id: HELP_ASSISTANT_SESSION_ID,
      messages: [
        { role: "system", content: systemInstruction },
        buildUserMessage(question, articles),
      ],
      max_tokens: 512,
      temperature: 0.3,
      reasoning: {
        effort: "low",
        exclude: true,
      },
    },
    {
      headers: buildHeaders(apiKey),
      timeout: 45_000,
    }
  );

  const cachedTokens = data.usage?.prompt_tokens_details?.cached_tokens ?? 0;
  if (cachedTokens > 0) {
    console.info(
      `OpenRouter prompt cache hit (${modelName}): ${cachedTokens} cached tokens`
    );
  }

  return data;
}

function extractAnswerText(data: OpenRouterChatResponse): string {
  const message = data.choices?.[0]?.message;
  if (!message) return "";

  const content = message.content?.trim();
  if (content) return content;

  const reasoning = message.reasoning?.trim();
  if (reasoning && !reasoning.includes(OUT_OF_SCOPE_MARKER)) {
    return reasoning;
  }

  return "";
}

function getRetryDelayMs(error: unknown): number {
  if (!isAxiosError(error)) return 2000;

  const retryAfter = error.response?.headers?.["retry-after"];
  if (typeof retryAfter === "string") {
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 8000);
    }
  }

  return 2000;
}

export async function generateGroundedAnswer(
  question: string,
  articles: ChatArticleContext[]
): Promise<{ answer: string; outOfScope: boolean; modelUsed?: string; fromCache?: boolean }> {
  if (!isChatbotEnabled() || articles.length === 0) {
    return { answer: "", outOfScope: true };
  }

  const cacheKey = buildResponseCacheKey(question, articles);
  if (isResponseCacheEnabled()) {
    const cached = getCachedChatbotResult(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY!.trim();

  const systemInstruction = `You are a friendly help center assistant for MechSpec LMS.
Answer ONLY using the HELP ARTICLES provided in the user message.
Be concise, clear, and conversational (2-4 sentences when possible).
If the answer is not contained in the articles, reply with exactly: ${OUT_OF_SCOPE_MARKER}
Do not invent features, prices, policies, or steps not described in the articles.`;

  let lastError: unknown;
  let sawRateLimit = false;

  for (const modelName of getModelCandidates()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await callOpenRouterModel(
          modelName,
          apiKey,
          systemInstruction,
          question,
          articles
        );
        const text = extractAnswerText(data);

        if (!text || text.includes(OUT_OF_SCOPE_MARKER)) {
          const result = { answer: "", outOfScope: true, modelUsed: modelName };
          return result;
        }

        const result = { answer: text, outOfScope: false, modelUsed: modelName };
        if (isResponseCacheEnabled()) {
          setCachedChatbotResult(cacheKey, result);
        }
        return result;
      } catch (error) {
        lastError = error;

        if (isAxiosError(error)) {
          const status = error.response?.status;
          const errorBody = error.response?.data as OpenRouterErrorBody | undefined;
          const message = errorBody?.error?.message ?? error.message;

          if (status === 404) {
            console.warn(`OpenRouter model unavailable (${modelName}): ${message}`);
            break;
          }

          if (status === 429) {
            sawRateLimit = true;
            if (attempt === 0) {
              const delayMs = getRetryDelayMs(error);
              console.warn(
                `OpenRouter rate limited (${modelName}), retrying in ${delayMs}ms...`
              );
              await sleep(delayMs);
              continue;
            }
            console.warn(`OpenRouter rate limited (${modelName}), trying next model...`);
            break;
          }

          if (status === 401 || status === 403) {
            throw new Error(
              "Authentication failed. Please contact support.",
              { cause: error }
            );
          }
        }

        throw error;
      }
    }
  }

  if (sawRateLimit) {
    throw new ChatbotRateLimitError();
  }

  const message =
    lastError instanceof Error ? lastError.message : "Unknown OpenRouter API error";
  throw new Error(`No compatible OpenRouter model available. Last error: ${message}`, {
    cause: lastError,
  });
}

export function formatRetrievalFallback(
  articles: ChatArticleContext[]
): string {
  if (articles.length === 0) {
    return "I could not find a matching help article. Your question has been logged for review.";
  }

  const primary = articles[0];
  return `Here's what I found in our help center (${primary.title}):\n\n${primary.content}`;
}
