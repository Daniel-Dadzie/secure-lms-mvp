import { prisma } from "../../config/prisma";

// ----------------------------------------------------------------------------
// Select shapes & Configuration Constants
// correctOption is NEVER included in any select used for student-facing reads.
// It is only fetched internally inside gradeAttempt(), server-side.
// ----------------------------------------------------------------------------

const quizMetaSelect = {
  id: true,
  lessonId: true,
  courseId: true,
  title: true,
  description: true,
  passMark: true,
  timeLimit: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const publicQuestionSelect = {
  id: true,
  text: true,
  options: true,
  order: true,
} as const;

const MAX_ATTEMPTS = 3;
const TIME_LIMIT_GRACE_PERIOD_MS = 15 * 1000; // 15-second grace period for network latency

// ----------------------------------------------------------------------------
// List all active quizzes for a course (metadata only, no questions)
// ----------------------------------------------------------------------------
export async function getCourseQuizzes(courseId: string) {
  return prisma.quiz.findMany({
    where: { courseId, isActive: true },
    select: quizMetaSelect,
    orderBy: { createdAt: "asc" },
  });
}

// ----------------------------------------------------------------------------
// Get the single quiz tied to a specific lesson (metadata only)
// ----------------------------------------------------------------------------
export async function getLessonQuiz(lessonId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { lessonId, isActive: true },
    select: quizMetaSelect,
  });

  if (!quiz) {
    const error = new Error("No quiz found for this lesson");
    (error as any).statusCode = 404;
    throw error;
  }

  return quiz;
}

// ----------------------------------------------------------------------------
// Start (or resume) a quiz attempt.
// - Verifies the quiz exists and is active
// - Verifies the student has a non-cancelled enrollment in the course
//   (deny-list, not allow-list: ACTIVE and COMPLETED enrollments are both
//   legitimate — a student who finished the course should still be able to
//   take/retake its quizzes. Only CANCELLED blocks access.)
// - Checks for an active IN_PROGRESS attempt to allow resuming without burning attempts
// - Enforces MAX_ATTEMPTS inside an interactive transaction to prevent race conditions
// - Returns questions WITHOUT correctOption, plus attempt metadata.
// ----------------------------------------------------------------------------
export async function startQuizAttempt(userId: string, quizId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      passMark: true,
      timeLimit: true,
      courseId: true,
      questions: {
        select: publicQuestionSelect,
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Deny-list: block only CANCELLED. ACTIVE and COMPLETED enrollments are both valid.
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: quiz.courseId } },
    select: { status: true },
  });

  if (!enrollment || enrollment.status === "CANCELLED") {
    const error = new Error("You do not have an active enrollment in this course");
    (error as any).statusCode = 403;
    throw error;
  }

  const attempt = await prisma.$transaction(async (tx) => {
    // 1. Resume check: Return existing IN_PROGRESS attempt if user hasn't submitted yet
    const activeAttempt = await tx.quizAttempt.findFirst({
      where: { quizId, userId, status: "IN_PROGRESS" },
      select: { id: true, startedAt: true },
    });

    if (activeAttempt) {
      return activeAttempt;
    }

    // 2. Maximum attempts check
    const totalAttempts = await tx.quizAttempt.count({
      where: { quizId, userId },
    });

    if (totalAttempts >= MAX_ATTEMPTS) {
      const error = new Error("Maximum attempts reached for this quiz");
      (error as any).statusCode = 403;
      throw error;
    }

    // 3. Create new attempt
    return tx.quizAttempt.create({
      data: {
        quizId,
        userId,
        status: "IN_PROGRESS",
      },
      select: { id: true, startedAt: true },
    });
  });

  return {
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passMark: quiz.passMark,
      timeLimit: quiz.timeLimit,
    },
    questions: quiz.questions,
  };
}

// ----------------------------------------------------------------------------
// Submit and grade an attempt.
// - Verifies ownership (404 to avoid leaking attempt existence)
// - Verifies attempt is IN_PROGRESS
// - Enforces server-side timeLimit with a 15s network latency buffer
// - Grades by comparing submitted answers against correctOption
// ----------------------------------------------------------------------------
export async function submitQuizAttempt(
  userId: string,
  attemptId: string,
  answers: Record<string, string>
) {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      status: true,
      startedAt: true,
      quiz: {
        select: {
          id: true,
          passMark: true,
          timeLimit: true, // Expected in seconds (e.g., 1800 for 30 mins)
          questions: {
            select: { id: true, correctOption: true },
          },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== userId) {
    const error = new Error("Attempt not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (attempt.status !== "IN_PROGRESS") {
    const error = new Error("This attempt has already been submitted");
    (error as any).statusCode = 409;
    throw error;
  }

  // Server-side time enforcement with network latency grace period
  const elapsedMs = Date.now() - attempt.startedAt.getTime();
  const maxAllowedMs =
    attempt.quiz.timeLimit != null
      ? attempt.quiz.timeLimit * 1000 + TIME_LIMIT_GRACE_PERIOD_MS
      : Infinity;

  const isExpired = elapsedMs > maxAllowedMs;

  // Grade against actual database correctOption
  const totalQuestions = attempt.quiz.questions.length;
  const correctCount = attempt.quiz.questions.filter(
    (q) => answers[q.id] === q.correctOption
  ).length;

  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

  const passed = !isExpired && score >= attempt.quiz.passMark;

  const updated = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      score,
      passed,
      status: isExpired ? "EXPIRED" : "SUBMITTED",
      completedAt: new Date(),
    },
    select: {
      id: true,
      quizId: true,
      status: true,
      score: true,
      passed: true,
      startedAt: true,
      completedAt: true,
    },
  });

  return updated;
}

// ----------------------------------------------------------------------------
// Student's own attempt history for a quiz
// ----------------------------------------------------------------------------
export async function getQuizAttempts(userId: string, quizId: string) {
  return prisma.quizAttempt.findMany({
    where: { quizId, userId },
    select: {
      id: true,
      status: true,
      score: true,
      passed: true,
      startedAt: true,
      completedAt: true,
    },
    orderBy: { startedAt: "desc" },
  });
}

// ----------------------------------------------------------------------------
// Instructor: create a quiz with questions.
// - Validates lesson ownership if attached to a lesson
// - Validates that each correctOption matches a valid option ID
// ----------------------------------------------------------------------------
export async function createQuiz(
  courseId: string,
  instructorId: string,
  input: {
    title: string;
    description?: string;
    lessonId?: string;
    passMark: number;
    timeLimit?: number;
    questions: {
      text: string;
      options: { id: string; text: string }[];
      correctOption: string;
      order: number;
    }[];
  }
) {
  // Validate lesson context
  if (input.lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: input.lessonId, module: { courseId } },
      select: { id: true },
    });

    if (!lesson) {
      const error = new Error("Lesson not found in this course");
      (error as any).statusCode = 404;
      throw error;
    }
  }

  // Validate correctOption existence for every question
  for (const q of input.questions) {
    const validOptionIds = q.options.map((opt) => opt.id);
    if (!validOptionIds.includes(q.correctOption)) {
      const error = new Error(
        `Question "${q.text}" has an invalid correctOption "${q.correctOption}". Must match one of: ${validOptionIds.join(", ")}`
      );
      (error as any).statusCode = 400;
      throw error;
    }
  }

  const quiz = await prisma.$transaction(async (tx) => {
    const createdQuiz = await tx.quiz.create({
      data: {
        courseId,
        lessonId: input.lessonId,
        title: input.title,
        description: input.description,
        passMark: input.passMark,
        timeLimit: input.timeLimit,
      },
    });

    await tx.question.createMany({
      data: input.questions.map((q) => ({
        quizId: createdQuiz.id,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        order: q.order,
      })),
    });

    await tx.auditEvent.create({
      data: {
        userId: instructorId,
        action: "quiz.create",
        entityType: "Quiz",
        entityId: createdQuiz.id,
        metadata: { courseId, title: input.title, questionCount: input.questions.length },
      },
    });

    return createdQuiz;
  });

  return prisma.quiz.findUnique({
    where: { id: quiz.id },
    select: { ...quizMetaSelect, questions: { select: publicQuestionSelect, orderBy: { order: "asc" } } },
  });
}

// ----------------------------------------------------------------------------
// Instructor: update quiz metadata
// ----------------------------------------------------------------------------
export async function updateQuiz(
  quizId: string,
  instructorId: string,
  input: {
    title?: string;
    description?: string;
    passMark?: number;
    timeLimit?: number;
    isActive?: boolean;
  }
) {
  const existing = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error("Quiz not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const quiz = await prisma.quiz.update({
    where: { id: quizId },
    data: input,
    select: quizMetaSelect,
  });

  await prisma.auditEvent.create({
    data: {
      userId: instructorId,
      action: "quiz.update",
      entityType: "Quiz",
      entityId: quizId,
      metadata: { updatedFields: Object.keys(input) },
    },
  });

  return quiz;
}

// ----------------------------------------------------------------------------
// Instructor: delete a quiz
// ----------------------------------------------------------------------------
export async function deleteQuiz(quizId: string, instructorId: string): Promise<void> {
  const existing = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error("Quiz not found");
    (error as any).statusCode = 404;
    throw error;
  }

  await prisma.quiz.delete({ where: { id: quizId } });

  await prisma.auditEvent.create({
    data: {
      userId: instructorId,
      action: "quiz.delete",
      entityType: "Quiz",
      entityId: quizId,
    },
  });
}

// ----------------------------------------------------------------------------
// Instructor: view quiz with correctOption included
// ----------------------------------------------------------------------------
export async function getQuizForInstructor(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      ...quizMetaSelect,
      questions: {
        select: { id: true, text: true, options: true, correctOption: true, order: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return quiz;
}