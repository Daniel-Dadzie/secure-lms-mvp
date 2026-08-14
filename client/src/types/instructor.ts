export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface InstructorCourseAnalytics {
  courseId: string;
  courseTitle: string;
  enrollmentCount: number;
  completionCount: number;
  revenueCents: number;
  averageProgress: number;
}

export interface InstructorOverview {
  courses: InstructorCourseAnalytics[];
  totals: {
    totalEnrollments: number;
    totalCompletions: number;
    totalRevenueCents: number;
  };
}

export interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  priceCents: number;
  status: CourseStatus;
  categoryId: string | null;
  category?: { id: string; name: string; slug: string } | null;
  createdAt: string;
  _count?: { enrollments: number };
}

export interface InstructorStudent {
  enrollmentId: string;
  studentId: string;
  fullName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
}

export interface InstructorReview {
  id: string;
  rating: number;
  comment: string | null;
  instructorReply: string | null;
  instructorReplyAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string };
  course: { id: string; title: string };
}

export interface InstructorAnalyticsTrends {
  months: string[];
  enrollmentVsCompletion: { month: string; enrollments: number; completions: number }[];
  revenueByMonth: { month: string; revenueCents: number }[];
  averageRating: number;
  summary: {
    totalEnrollments: number;
    totalCompletions: number;
    totalRevenueCents: number;
  };
}

export interface InstructorPurchase {
  id: string;
  finalAmountCents: number;
  amountCents: number;
  discountCents: number;
  createdAt: string;
  course: { id: string; title: string };
  user: { id: string; fullName: string; email: string };
  coupon: { code: string } | null;
}

export interface InstructorProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  specialization: string | null;
  credentials: string | null;
  shortBio: string | null;
  bio: string | null;
  expertise: string[];
  experienceYears: string | null;
  instructorCategory: string | null;
  region: string | null;
}

export type { SupportTicketSummary } from "./support";
