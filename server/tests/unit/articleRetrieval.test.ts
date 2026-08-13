import { describe, it, expect } from "vitest";
import { retrieveRelevantArticles } from "../../src/lib/articleRetrieval";

describe("articleRetrieval", () => {
  const articles = [
    {
      id: "1",
      title: "How to Reset Your Password",
      category: "account",
      content: "Go to login and click Forgot Password. Enter your email to receive a reset link.",
    },
    {
      id: "2",
      title: "How to Enroll in a Course",
      category: "courses",
      content: "Browse the catalogue, add a course to your cart, and complete checkout.",
    },
  ];

  it("ranks password article highest for password questions", () => {
    const results = retrieveRelevantArticles("I forgot my password", articles, 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].article.title).toContain("Password");
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("returns empty array when no articles exist", () => {
    expect(retrieveRelevantArticles("anything", [], 3)).toEqual([]);
  });
});
