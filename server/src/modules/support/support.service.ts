import { prisma } from "../../config/prisma";

// ----------------------------------------------------------------------------
// FAQ knowledge base — curated platform-specific answers.
// Stored in code for MVP. Post-MVP: move to DB for admin management.
// The assistant is intentionally constrained to these topics only —
// it cannot be prompted into answering outside its scope.
// This directly addresses the prompt injection threat (TB7) from
// the security team's threat model.
// ----------------------------------------------------------------------------
const FAQ_KNOWLEDGE_BASE = [
  {
    keywords: ["register", "sign up", "create account", "new account"],
    answer:
      "To register, click the 'Create Account' button on the login page. Fill in your full name, email address, password (minimum 8 characters), and select your role (Student or Instructor). Click Register and you will be redirected to log in.",
  },
  {
    keywords: ["login", "log in", "sign in", "access account"],
    answer:
      "To log in, go to the login page and enter your registered email and password. If your credentials are correct, you will be redirected to your dashboard automatically.",
  },
  {
    keywords: ["password", "reset", "forgot", "change password"],
    answer:
      "If you have forgotten your password, please contact the platform administrator who can reset it for you. Password reset emails are not available in the current version.",
  },
  {
    keywords: ["enroll", "enrolment", "join course", "access course"],
    answer:
      "To enroll in a course, browse the course catalogue, click on a course you are interested in, and click 'Add to Cart'. Proceed to checkout to complete your enrollment. Free courses can be enrolled in directly without payment.",
  },
  {
    keywords: ["purchase", "buy", "payment", "checkout", "cart"],
    answer:
      "To purchase a course, add it to your cart from the course catalogue. Go to your cart and click 'Checkout'. Payments are simulated — no real card details are required. After checkout, you will be automatically enrolled.",
  },
  {
    keywords: ["certificate", "completion", "finish course"],
    answer:
      "You earn a certificate when you complete all lessons in a course. Once every lesson is marked as completed, your certificate is automatically issued and available in your profile under 'My Certificates'.",
  },
  {
    keywords: ["progress", "track", "lesson", "mark complete"],
    answer:
      "Your progress is tracked automatically as you complete lessons. Open a lesson from your enrolled course, watch the content, and mark it as complete. Your progress percentage updates on your student dashboard.",
  },
  {
    keywords: ["create course", "upload course", "publish course", "instructor"],
    answer:
      "As an instructor, go to your dashboard and click 'Create Course'. Fill in the title, description, and price. Add modules and lessons to structure your content. Upload thumbnails via the course editor and videos per lesson. When ready, click 'Publish' to make the course available to students.",
  },
  {
    keywords: ["refund", "money back", "cancel"],
    answer:
      "Refunds are not available in the current MVP version. All purchases are final. Please review the course details carefully before purchasing.",
  },
  {
    keywords: ["admin", "administrator", "manage users", "suspend"],
    answer:
      "Administrators can manage users, moderate courses, and view platform activity from the Admin Dashboard. Contact your platform administrator if you need account-level assistance.",
  },
  {
    keywords: ["contact", "support", "help", "issue", "problem"],
    answer:
      "For platform issues not covered here, please contact the platform administrator directly. This assistant can only answer questions about platform features and usage.",
  },
];

// ----------------------------------------------------------------------------
// Match question to FAQ entry using keyword scoring.
// Returns the best match above a confidence threshold.
// If no match found, returns a safe fallback — never attempts to
// answer outside its knowledge base (prevents scope abuse).
// ----------------------------------------------------------------------------
function findAnswer(question: string): {
  answer: string;
  confidence: number;
} {
  const normalised = question.toLowerCase().trim();

  let bestMatch = { answer: "", confidence: 0, index: -1 };

  FAQ_KNOWLEDGE_BASE.forEach((entry, i) => {
    const matchedKeywords = entry.keywords.filter((kw) =>
      normalised.includes(kw)
    );
    const confidence = matchedKeywords.length / entry.keywords.length;
    if (confidence > bestMatch.confidence) {
      bestMatch = { answer: entry.answer, confidence, index: i };
    }
  });

  // Threshold: at least one keyword must match
  if (bestMatch.confidence === 0 || bestMatch.index === -1) {
    return {
      answer:
        "I can only answer questions about platform features such as registration, login, purchasing courses, enrollment, progress tracking, and certificates. Please rephrase your question or contact the platform administrator for other issues.",
      confidence: 0,
    };
  }

  return { answer: bestMatch.answer, confidence: bestMatch.confidence };
}

// ----------------------------------------------------------------------------
// Ask the support assistant a question
// ----------------------------------------------------------------------------
export async function askSupport(
  question: string,
  userId?: string
): Promise<{ answer: string; confidence: number }> {
  const result = findAnswer(question);

  // Log every support interaction for audit purposes
  await prisma.auditEvent.create({
    data: {
      userId: userId || null,
      action: "support.question_asked",
      metadata: {
        question: question.substring(0, 500), // truncate for storage
        confidence: result.confidence,
        answered: result.confidence > 0,
      },
    },
  });

  return result;
}