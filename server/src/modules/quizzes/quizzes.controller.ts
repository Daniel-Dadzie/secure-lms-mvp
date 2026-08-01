import type { Request, Response, NextFunction } from "express";
import * as quizzesService from "./quizzes.service";
import { submitAttemptSchema } from "./quizzes.schemas";
import { createQuizSchema, updateQuizSchema } from "./quizzes.schemas";

export async function getCourseQuizzes(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const quizzes = await quizzesService.getCourseQuizzes(req.params.courseId as string);
    res.status(200).json({ quizzes });
  } catch (error) { next(error); }
}

export async function getLessonQuiz(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const quiz = await quizzesService.getLessonQuiz(req.params.lessonId as string);
    res.status(200).json({ quiz });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}

export async function startQuizAttempt(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const result = await quizzesService.startQuizAttempt(userId, req.params.quizId as string);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    if (error.statusCode === 403) { res.status(403).json({ message: error.message }); return; }
    next(error);
  }
}

export async function submitQuizAttempt(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = submitAttemptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const result = await quizzesService.submitQuizAttempt(
      userId,
      req.params.attemptId as string,
      parsed.data.answers
    );
    res.status(200).json({ attempt: result });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    if (error.statusCode === 409) { res.status(409).json({ message: error.message }); return; }
    next(error);
  }
}

export async function getQuizAttempts(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const attempts = await quizzesService.getQuizAttempts(userId, req.params.quizId as string);
    res.status(200).json({ attempts });
  } catch (error) { next(error); }
}


export async function createQuiz(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = createQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user?.sub;
    const quiz = await quizzesService.createQuiz(
      req.params.courseId as string, instructorId, parsed.data
    );
    res.status(201).json({ quiz });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}

export async function updateQuiz(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const parsed = updateQuizSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user?.sub;
    const quiz = await quizzesService.updateQuiz(
      req.params.quizId as string, instructorId, parsed.data
    );
    res.status(200).json({ quiz });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}

export async function deleteQuiz(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const instructorId = (req as any).user?.sub;
    await quizzesService.deleteQuiz(req.params.quizId as string, instructorId);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function getQuizForInstructor(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const quiz = await quizzesService.getQuizForInstructor(req.params.quizId as string);
    res.status(200).json({ quiz });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: error.message }); return; }
    next(error);
  }
}