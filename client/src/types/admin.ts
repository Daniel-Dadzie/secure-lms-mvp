import type { Role } from "@/types/auth";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    coursesTaught: number;
    purchases: number;
  };
}

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  priceCents: number;
  status: CourseStatus;
  instructorId: string;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    fullName: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  } | null;
  _count: {
    enrollments: number;
    reviews: number;
  };
}

export interface AuditEventUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuditEvent {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: AuditEventUser | null;
}

export interface PlatformStats {
  users: {
    total: number;
    students: number;
    instructors: number;
  };
  courses: {
    total: number;
    published: number;
  };
  enrollments: {
    total: number;
  };
  revenue: {
    totalPurchases: number;
    totalRevenueCents: number;
  };
  recentActivity: AuditEvent[];
}

export interface AuditLogResponse {
  events: AuditEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  courseCount?: number;
}

export interface MonthlyDataPoint {
  month: string;
  count?: number;
  revenueCents?: number;
  purchaseCount?: number;
}

export interface EnrollmentVsCompletionPoint {
  month: string;
  enrollments: number;
  completions: number;
}

export interface RegionBreakdown {
  region: string;
  label: string;
  count: number;
}

export interface AnalyticsOverview {
  registrations: MonthlyDataPoint[];
  revenue: MonthlyDataPoint[];
  enrollments: MonthlyDataPoint[];
  completions: MonthlyDataPoint[];
  enrollmentVsCompletion: EnrollmentVsCompletionPoint[];
  studentsByCategory: { category: string; count: number }[];
  studentsByRegion: RegionBreakdown[];
  instructorsByRegion: RegionBreakdown[];
  summary: {
    userGrowthPercent: number;
    revenueGrowthPercent: number;
    newUsersThisMonth: number;
    revenueThisMonthCents: number;
    platformCompletionRate: number;
    monthlyActiveUsers: number;
  };
}

export type TopCourseSort = "students" | "completions" | "revenue" | "ratings";

export interface TopCourseRow {
  id: string;
  title: string;
  instructorName: string;
  categoryName: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  revenueCents: number;
  averageRating: number;
  reviewCount: number;
}

export type TopInstructorSort = "completions" | "revenue" | "ratings";

export interface TopInstructorRow {
  id: string;
  fullName: string;
  specialization: string | null;
  courseCount: number;
  enrollments: number;
  completions: number;
  completionRate: number;
  revenueCents: number;
  averageRating: number;
  reviewCount: number;
}

export interface PlatformHealth {
  status: string;
  database: { status: string; responseMs: number };
  purchases: { pending: number; failed: number; completedToday: number };
  users: { activeSessions: number };
  auth: { failedLogins24h: number };
  support: { unansweredQuestions24h: number };
  uptime: { serverStartedAt: string };
}

export interface ReportsSummary {
  users: number;
  courses: number;
  purchases: number;
  enrollments: number;
  auditEvents: number;
}

export interface SupportMessage {
  id: string;
  userId: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  resolved?: boolean;
  user: AuditEventUser | null;
}

export interface AdminPurchase {
  id: string;
  userId: string;
  courseId: string;
  amountCents: number;
  finalAmountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  course: { id: string; title: string };
}

export interface AdminReview {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  course: { id: string; title: string };
}

export interface AdminEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  user: { id: string; fullName: string; email: string };
  course: { id: string; title: string };
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  _count?: { usages: number };
}

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  isPublished: boolean;
  order: number;
}

export interface AdminInstructor {
  id: string;
  email: string;
  fullName: string;
  specialization: string | null;
  avatarUrl: string | null;
  createdAt: string;
  stats: {
    courses: number;
    enrollments: number;
    completions: number;
    completionRate: number;
    revenueCents: number;
  };
}

export interface SupportTicket {
  id: string;
  userId: string | null;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; fullName: string; email: string } | null;
  messages?: Array<{
    id: string;
    body: string;
    isStaff: boolean;
    createdAt: string;
    sender: { id: string; fullName: string; role: string } | null;
  }>;
  _count?: { messages: number };
}
