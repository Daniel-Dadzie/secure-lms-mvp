import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as adminService from "./admin.service";
import * as analyticsService from "./admin-analytics.service";
import * as healthService from "./admin-health.service";
import * as reportsService from "./admin-reports.service";
import * as messagesService from "./admin-messages.service";
import * as purchasesService from "./admin-purchases.service";
import * as reviewsService from "./admin-reviews.service";
import * as enrollmentsService from "./admin-enrollments.service";
import * as couponsService from "../coupons/coupons.service";
import * as helpService from "../help/help.service";
import * as instructorsService from "./admin-instructors.service";
import * as announcementsService from "./admin-announcements.service";
import * as ticketsService from "./admin-tickets.service";
import { logAuditEvent } from "../../lib/auditLog";

const auditLogFiltersSchema = z.object({
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const monthsSchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const resolveMessageSchema = z.object({
  note: z.string().max(500).optional(),
});

const refundSchema = z.object({}).optional();

const manualEnrollSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
});

const couponSchema = z.object({
  code: z.string().min(2).max(50),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().int().min(1),
  maxUses: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

const helpArticleSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(10),
  category: z.string().min(2).max(100),
  isPublished: z.boolean().optional(),
  order: z.number().int().optional(),
});

const announcementSchema = z.object({
  title: z.string().min(2).max(200),
  message: z.string().min(2).max(1000),
  targetRole: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
});

const ticketReplySchema = z.object({
  body: z.string().min(1).max(2000),
});

const ticketUpdateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
});

function sendCsv(res: Response, filename: string, content: string) {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(content);
}

export async function getPlatformStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getPlatformStats();
    res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = auditLogFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid filters" });
      return;
    }
    const result = await adminService.getAuditLog(parsed.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAllCourses(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const courses = await adminService.getAllCoursesAdmin();
    res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await adminService.getAllUsersAdmin();
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
}

export async function verifyUserEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await adminService.verifyUserEmail(req.params.userId as string, adminId);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getAnalyticsOverview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = monthsSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query" });
      return;
    }
    const analytics = await analyticsService.getAnalyticsOverview(parsed.data.months);
    res.status(200).json({ analytics });
  } catch (error) {
    next(error);
  }
}

export async function getTopCourses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 20);
    const sort = (req.query.sort as analyticsService.TopCourseSort) || "students";
    const validSorts: analyticsService.TopCourseSort[] = [
      "students",
      "completions",
      "revenue",
      "ratings",
    ];
    const courses = await analyticsService.getTopCourses(
      limit,
      validSorts.includes(sort) ? sort : "students"
    );
    res.status(200).json({ courses });
  } catch (error) {
    next(error);
  }
}

export async function getTopInstructors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 20);
    const sort = (req.query.sort as analyticsService.TopInstructorSort) || "completions";
    const validSorts: analyticsService.TopInstructorSort[] = ["completions", "revenue", "ratings"];
    const instructors = await analyticsService.getTopInstructors(
      limit,
      validSorts.includes(sort) ? sort : "completions"
    );
    res.status(200).json({ instructors });
  } catch (error) {
    next(error);
  }
}

export async function getAdminHealth(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const health = await healthService.getPlatformHealth();
    res.status(200).json({ health });
  } catch (error) {
    next(error);
  }
}

export async function getReportsSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await reportsService.getReportsSummary();
    res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
}

export async function exportReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const type = req.params.type as string;
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    switch (type) {
      case "users":
        sendCsv(res, "users.csv", await reportsService.exportUsersCsv());
        break;
      case "courses":
        sendCsv(res, "courses.csv", await reportsService.exportCoursesCsv());
        break;
      case "purchases":
        sendCsv(res, "purchases.csv", await reportsService.exportPurchasesCsv(from, to));
        break;
      case "enrollments":
        sendCsv(res, "enrollments.csv", await reportsService.exportEnrollmentsCsv());
        break;
      case "audit-log":
        sendCsv(res, "audit-log.csv", await reportsService.exportAuditLogCsv(from, to));
        break;
      default:
        res.status(404).json({ message: "Unknown report type" });
    }
  } catch (error) {
    next(error);
  }
}

export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const answered =
      req.query.answered === "true"
        ? true
        : req.query.answered === "false"
          ? false
          : undefined;
    const result = await messagesService.getSupportMessages({ answered, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMessagesUnreadCount(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await messagesService.getSupportUnreadCount();
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
}

export async function resolveMessage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = resolveMessageSchema.safeParse(req.body);
    const adminId = (req as any).user?.sub;
    await messagesService.resolveSupportMessage(
      req.params.eventId as string,
      adminId,
      parsed.success ? parsed.data.note : undefined
    );
    res.status(200).json({ message: "Resolved" });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getPurchases(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination" });
      return;
    }
    const result = await purchasesService.getPurchases({
      ...parsed.data,
      status: req.query.status as string | undefined,
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function refundPurchase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    refundSchema.safeParse(req.body);
    const adminId = (req as any).user?.sub;
    await purchasesService.refundPurchase(req.params.purchaseId as string, adminId);
    res.status(200).json({ message: "Purchase refunded" });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination" });
      return;
    }
    const visible =
      req.query.visible === "true" ? true : req.query.visible === "false" ? false : undefined;
    const result = await reviewsService.getAdminReviews({
      ...parsed.data,
      visible,
      courseId: req.query.courseId as string | undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function hideReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await reviewsService.hideReviewAdmin(req.params.reviewId as string, adminId);
    res.status(204).send();
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function restoreReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await reviewsService.restoreReviewAdmin(req.params.reviewId as string, adminId);
    res.status(200).json({ message: "Review restored" });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getEnrollments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination" });
      return;
    }
    const result = await enrollmentsService.getEnrollments({
      ...parsed.data,
      status: req.query.status as string | undefined,
      courseId: req.query.courseId as string | undefined,
      userId: req.query.userId as string | undefined,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = manualEnrollSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const adminId = (req as any).user?.sub;
    const enrollment = await enrollmentsService.manualEnroll(
      parsed.data.userId,
      parsed.data.courseId,
      adminId
    );
    res.status(201).json({ enrollment });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function cancelEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    await enrollmentsService.cancelEnrollment(req.params.enrollmentId as string, adminId);
    res.status(200).json({ message: "Enrollment cancelled" });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getCoupons(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const coupons = await couponsService.getAllCoupons();
    res.status(200).json({ coupons });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = couponSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const adminId = (req as any).user?.sub;
    const coupon = await couponsService.createCoupon({
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    });
    await logAuditEvent({
      userId: adminId,
      action: "admin.coupon_created",
      entityType: "Coupon",
      entityId: coupon.id,
      metadata: { code: coupon.code, discountType: coupon.discountType },
    });
    res.status(201).json({ coupon });
  } catch (error: any) {
    if (error.statusCode === 409) {
      res.status(409).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function updateCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    const couponId = req.params.couponId as string;
    const coupon = await couponsService.updateCoupon(couponId, req.body);
    if (req.body?.isActive === false) {
      await logAuditEvent({
        userId: adminId,
        action: "admin.coupon_deactivated",
        entityType: "Coupon",
        entityId: couponId,
        metadata: { code: coupon.code },
      });
    }
    res.status(200).json({ coupon });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function deleteCoupon(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    const couponId = req.params.couponId as string;
    const existing = await couponsService.getAllCoupons().then((list) =>
      list.find((c) => c.id === couponId)
    );
    await couponsService.deactivateCoupon(couponId);
    await logAuditEvent({
      userId: adminId,
      action: "admin.coupon_deactivated",
      entityType: "Coupon",
      entityId: couponId,
      metadata: existing ? { code: existing.code } : undefined,
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getHelpArticles(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const articles = await helpService.getAllHelpArticles(true);
    res.status(200).json({ articles });
  } catch (error) {
    next(error);
  }
}

export async function createHelpArticle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = helpArticleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const adminId = (req as any).user?.sub;
    const article = await helpService.createHelpArticle(parsed.data);
    await logAuditEvent({
      userId: adminId,
      action: parsed.data.isPublished ? "admin.help_article_published" : "admin.help_article_created",
      entityType: "HelpArticle",
      entityId: article.id,
      metadata: { title: article.title, category: article.category },
    });
    res.status(201).json({ article });
  } catch (error) {
    next(error);
  }
}

export async function updateHelpArticle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = helpArticleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten().fieldErrors });
      return;
    }
    const adminId = (req as any).user?.sub;
    const articleId = req.params.articleId as string;
    const before = await helpService.getAllHelpArticles(true).then((list) =>
      list.find((a) => a.id === articleId)
    );
    const article = await helpService.updateHelpArticle(articleId, parsed.data);
    const wasPublished = before?.isPublished;
    const isPublished = article.isPublished;
    let action = "admin.help_article_updated";
    if (!wasPublished && isPublished) action = "admin.help_article_published";
    else if (wasPublished && !isPublished) action = "admin.help_article_unpublished";
    else if (isPublished && parsed.data.content) action = "admin.help_article_edited";
    await logAuditEvent({
      userId: adminId,
      action,
      entityType: "HelpArticle",
      entityId: article.id,
      metadata: { title: article.title, category: article.category },
    });
    res.status(200).json({ article });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function deleteHelpArticle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = (req as any).user?.sub;
    const articleId = req.params.articleId as string;
    const before = await helpService.getAllHelpArticles(true).then((list) =>
      list.find((a) => a.id === articleId)
    );
    await helpService.deleteHelpArticle(articleId);
    await logAuditEvent({
      userId: adminId,
      action: "admin.help_article_deleted",
      entityType: "HelpArticle",
      entityId: articleId,
      metadata: before ? { title: before.title } : undefined,
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getInstructors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination" });
      return;
    }
    const result = await instructorsService.getInstructors(parsed.data.page, parsed.data.limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getInstructorDetail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const instructor = await instructorsService.getInstructorDetail(
      req.params.instructorId as string
    );
    res.status(200).json({ instructor });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function sendAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = announcementSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const adminId = (req as any).user?.sub;
    const result = await announcementsService.broadcastAnnouncement({
      ...parsed.data,
      adminId,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAnnouncements(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const announcements = await announcementsService.getAnnouncementHistory();
    res.status(200).json({ announcements });
  } catch (error) {
    next(error);
  }
}

export async function getTickets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid pagination" });
      return;
    }
    const result = await ticketsService.getTickets({
      ...parsed.data,
      status: req.query.status as any,
      priority: req.query.priority as any,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticket = await ticketsService.getTicketById(req.params.ticketId as string);
    res.status(200).json({ ticket });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function replyToTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = ticketReplySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const adminId = (req as any).user?.sub;
    const message = await ticketsService.replyToTicket(
      req.params.ticketId as string,
      adminId,
      parsed.data.body
    );
    res.status(201).json({ message });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function updateTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = ticketUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }
    const adminId = (req as any).user?.sub;
    const ticket = await ticketsService.updateTicket(
      req.params.ticketId as string,
      parsed.data,
      adminId
    );
    res.status(200).json({ ticket });
  } catch (error: any) {
    if (error.statusCode === 404) {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function getTicketsOpenCount(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await ticketsService.getOpenTicketCount();
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
}
