import { createHash } from "crypto";

export interface ChatArticleContext {
  title: string;
  category: string;
  content: string;
}

interface CachedChatbotResult {
  answer: string;
  outOfScope: boolean;
  modelUsed?: string;
}

interface CacheEntry extends CachedChatbotResult {
  expiresAt: number;
}

const MAX_ENTRIES = 200;

const cache = new Map<string, CacheEntry>();

function getTtlMs(): number {
  const minutes = Number.parseInt(process.env.CHATBOT_RESPONSE_CACHE_TTL_MINUTES ?? "5", 10);
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 5) * 60_000;
}

export function isResponseCacheEnabled(): boolean {
  return process.env.CHATBOT_RESPONSE_CACHE_ENABLED !== "false";
}

export function normalizeQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, " ");
}

export function buildArticlesFingerprint(articles: ChatArticleContext[]): string {
  const payload = articles
    .map((article) => `${article.title}\n${article.category}\n${article.content}`)
    .join("\n---\n");

  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function buildResponseCacheKey(
  question: string,
  articles: ChatArticleContext[],
  modelHint?: string
): string {
  return `${normalizeQuestion(question)}::${buildArticlesFingerprint(articles)}::${modelHint ?? "default"}`;
}

export function getCachedChatbotResult(key: string): CachedChatbotResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return {
    answer: entry.answer,
    outOfScope: entry.outOfScope,
    modelUsed: entry.modelUsed,
  };
}

export function setCachedChatbotResult(
  key: string,
  result: CachedChatbotResult
): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, {
    ...result,
    expiresAt: Date.now() + getTtlMs(),
  });
}

/** @internal Test helper */
export function clearChatbotResponseCache(): void {
  cache.clear();
}
