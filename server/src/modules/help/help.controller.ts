import type { Request, Response, NextFunction } from "express";
import * as helpService from "./help.service";

export async function getPublishedArticles(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const articles = await helpService.getPublishedHelpArticles();
    res.status(200).json({ articles });
  } catch (error) {
    next(error);
  }
}
