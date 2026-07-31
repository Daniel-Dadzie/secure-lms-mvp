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