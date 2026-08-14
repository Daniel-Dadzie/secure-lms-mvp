export interface HelpArticleLike {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface RetrievedArticle {
  article: HelpArticleLike;
  score: number;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "shall", "can", "need",
  "how", "what", "when", "where", "why", "who", "which", "this", "that",
  "these", "those", "i", "me", "my", "we", "our", "you", "your", "it",
  "its", "they", "them", "their",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  const max = Math.max(...tf.values(), 1);
  for (const [term, count] of tf) {
    tf.set(term, count / max);
  }
  return tf;
}

function buildIdf(corpus: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  const n = corpus.length;

  for (const doc of corpus) {
    const unique = new Set(doc);
    for (const term of unique) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, docFreq] of df) {
    idf.set(term, Math.log((n + 1) / (docFreq + 1)) + 1);
  }
  return idf;
}

function vectorize(
  tf: Map<string, number>,
  idf: Map<string, number>
): Map<string, number> {
  const vec = new Map<string, number>();
  for (const [term, freq] of tf) {
    vec.set(term, freq * (idf.get(term) ?? 1));
  }
  return vec;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const val of a.values()) normA += val * val;
  for (const val of b.values()) normB += val * val;

  for (const [term, valA] of a) {
    const valB = b.get(term);
    if (valB !== undefined) dot += valA * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function articleDocument(article: HelpArticleLike): string {
  return `${article.title} ${article.category} ${article.content}`;
}

export function retrieveRelevantArticles(
  question: string,
  articles: HelpArticleLike[],
  limit = 3
): RetrievedArticle[] {
  if (articles.length === 0) return [];

  const questionTokens = tokenize(question);
  if (questionTokens.length === 0) return [];

  const docTokens = articles.map((article) => tokenize(articleDocument(article)));
  const idf = buildIdf(docTokens);
  const questionVec = vectorize(termFrequency(questionTokens), idf);

  const scored = articles.map((article, index) => ({
    article,
    score: cosineSimilarity(questionVec, vectorize(termFrequency(docTokens[index]), idf)),
  }));

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
