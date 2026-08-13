import { z } from "zod";

export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  courseId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  courseId: z.string().uuid().optional(),
});

export const replyToReviewSchema = z.object({
  reply: z.string().min(1, "Reply is required").max(2000).trim(),
});

export const listEarningsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  courseId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const updateInstructorProfileSchema = z.object({
  fullName: z.string().min(2).max(100).trim().optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
  specialization: z.string().max(200).trim().optional().or(z.literal("")),
  credentials: z.string().max(500).trim().optional().or(z.literal("")),
  shortBio: z.string().max(300).trim().optional().or(z.literal("")),
  bio: z.string().max(5000).trim().optional().or(z.literal("")),
  expertise: z.array(z.string().max(100)).max(20).optional(),
  experienceYears: z.coerce.string().max(20).optional().or(z.literal("")),
  instructorCategory: z.string().max(100).trim().optional().or(z.literal("")),
  region: z.enum(["NORTH_AMERICA", "LATIN_AMERICA", "EUROPE", "AFRICA", "MIDDLE_EAST", "ASIA_PACIFIC"]).optional(),
});

export const createUserTicketSchema = z.object({
  subject: z.string().min(3).max(200).trim(),
  body: z.string().min(10).max(5000).trim(),
  category: z.string().max(100).optional(),
});

export const userTicketReplySchema = z.object({
  body: z.string().min(1).max(5000).trim(),
});

export const analyticsTrendsQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(12),
  courseId: z.string().uuid().optional(),
});
