import { Router } from "express";
import { authenticate, requireRole } from "../../middleware";
import * as adminController from "./admin.controller";

const router = Router();
const adminOnly = [authenticate, requireRole(["ADMIN"])];

// Phase 1
router.get("/stats", ...adminOnly, adminController.getPlatformStats);
router.get("/audit-log", ...adminOnly, adminController.getAuditLog);
router.get("/courses", ...adminOnly, adminController.getAllCourses);
router.get("/users", ...adminOnly, adminController.getAllUsers);
router.post("/users/:userId/verify-email", ...adminOnly, adminController.verifyUserEmail);

// Phase 2A — Analytics & Health
router.get("/analytics/overview", ...adminOnly, adminController.getAnalyticsOverview);
router.get("/analytics/courses/top", ...adminOnly, adminController.getTopCourses);
router.get("/analytics/instructors/top", ...adminOnly, adminController.getTopInstructors);
router.get("/health", ...adminOnly, adminController.getAdminHealth);

// Phase 2B — Reports
router.get("/reports/summary", ...adminOnly, adminController.getReportsSummary);
router.get("/reports/:type", ...adminOnly, adminController.exportReport);

// Phase 2C-1 — Lite messages
router.get("/messages/unread-count", ...adminOnly, adminController.getMessagesUnreadCount);
router.get("/messages", ...adminOnly, adminController.getMessages);
router.patch("/messages/:eventId/resolve", ...adminOnly, adminController.resolveMessage);

// Phase 2C-2 — Tickets
router.get("/tickets/open-count", ...adminOnly, adminController.getTicketsOpenCount);
router.get("/tickets", ...adminOnly, adminController.getTickets);
router.get("/tickets/:ticketId", ...adminOnly, adminController.getTicket);
router.post("/tickets/:ticketId/reply", ...adminOnly, adminController.replyToTicket);
router.patch("/tickets/:ticketId", ...adminOnly, adminController.updateTicket);

// Phase 2D — Operations
router.get("/purchases", ...adminOnly, adminController.getPurchases);
router.patch("/purchases/:purchaseId/refund", ...adminOnly, adminController.refundPurchase);

router.get("/reviews", ...adminOnly, adminController.getReviews);
router.patch("/reviews/:reviewId/hide", ...adminOnly, adminController.hideReview);
router.patch("/reviews/:reviewId/restore", ...adminOnly, adminController.restoreReview);

router.get("/enrollments", ...adminOnly, adminController.getEnrollments);
router.post("/enrollments", ...adminOnly, adminController.createEnrollment);
router.patch("/enrollments/:enrollmentId/cancel", ...adminOnly, adminController.cancelEnrollment);

router.get("/coupons", ...adminOnly, adminController.getCoupons);
router.post("/coupons", ...adminOnly, adminController.createCoupon);
router.patch("/coupons/:couponId", ...adminOnly, adminController.updateCoupon);
router.delete("/coupons/:couponId", ...adminOnly, adminController.deleteCoupon);

router.get("/help-articles", ...adminOnly, adminController.getHelpArticles);
router.post("/help-articles", ...adminOnly, adminController.createHelpArticle);
router.patch("/help-articles/:articleId", ...adminOnly, adminController.updateHelpArticle);
router.delete("/help-articles/:articleId", ...adminOnly, adminController.deleteHelpArticle);

router.get("/instructors", ...adminOnly, adminController.getInstructors);
router.get("/instructors/:instructorId", ...adminOnly, adminController.getInstructorDetail);

router.get("/announcements", ...adminOnly, adminController.getAnnouncements);
router.post("/announcements", ...adminOnly, adminController.sendAnnouncement);

export default router;
