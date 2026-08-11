import type { Request, Response, NextFunction } from "express";
import * as coursesService from "./courses.service";
import { createCourseSchema, updateCourseSchema, courseFiltersSchema } from "./courses.schemas";

export async function getPublishedCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = courseFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid filters", errors: parsed.error.flatten().fieldErrors });
      return;
      
    }
    const result = await coursesService.getPublishedCourses(parsed.data);
    res.status(200).json(result);
  } catch (error) { next(error); }
}

export async function getPublishedCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await coursesService.getPublishedCourseById(req.params.courseId as string);
    res.status(200).json({ course });
  } catch (error: any) {
    if (error.statusCode === 404) { res.status(404).json({ message: "Course not found" }); return; }
    next(error);
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const instructorId = (req as any).user?.sub;
    const course = await coursesService.createCourse(instructorId, parsed.data);
    res.status(201).json({ course });
  } catch (error) { next(error); }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const userId = (req as any).user?.sub;
    const course = await coursesService.updateCourse(req.params.courseId as string,  parsed.data, userId);
    res.status(200).json({ course });
  } catch (error) { next(error); }
}

export async function publishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const course = await coursesService.publishCourse(req.params.courseId as string, userId);
    res.status(200).json({ course });
  } catch (error) { next(error); }
}

export async function unpublishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.sub;
    const course = await coursesService.unpublishCourse(req.params.courseId as string, userId);
    res.status(200).json({ course });
  } catch (error) { next(error); }
}

export async function archiveCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await coursesService.archiveCourse(req.params.courseId as string, adminId);
    res.status(204).send();
  } catch (error) { next(error); }
}

export async function getInstructorCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const instructorId = (req as any).user?.sub;
    const courses = await coursesService.getInstructorCourses(instructorId);
    res.status(200).json({ courses });
  } catch (error) { next(error); }
}

export async function getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courses = await coursesService.getAllCourses();
    res.status(200).json({ courses });
  } catch (error) { next(error); }
}