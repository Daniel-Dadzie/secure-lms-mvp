import type { CourseStatus } from "@prisma/client";

export interface CreateCourseInput {
  title: string;
  description: string;
  categoryId?: string;
  priceCents: number;
  thumbnailUrl?: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  categoryId?: string;
  priceCents?: number;
  thumbnailUrl?: string;
  status?: CourseStatus;
  learningObjectives?: string[];
}

export interface CourseFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCourses {
  data: CourseResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseAccessInfo {
  canPlayContent: boolean;
  isEnrolled: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isPreview: boolean;
}

export interface CourseResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  priceCents: number;
  status: CourseStatus;
  instructorId: string;
  instructor: {
    id: string;
    fullName: string;
    email: string;
  };
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseDetailResponse extends CourseResponse {
  longDescription?: string | null;
  duration?: string | null;
  level?: string | null;
  highlights?: string[];
  learningObjectives?: string[];
  averageRating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  access: CourseAccessInfo;
  enrollmentId?: string;
}