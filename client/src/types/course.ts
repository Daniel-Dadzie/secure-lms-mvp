export interface CourseLessonPreview {
  id: string;
  title: string;
  order: number;
  durationSeconds?: number | null;
}

export interface CourseModulePreview {
  id: string;
  title: string;
  order: number;
  lessons: CourseLessonPreview[];
}

export interface CourseAccessInfo {
  canPlayContent: boolean;
  isEnrolled: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isPreview: boolean;
}

export interface CourseReview {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  instructorReply: string | null;
  instructorReplyAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string };
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  averageRating: number;
  totalReviews: number;
  distribution: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  page: number;
  totalPages: number;
  myReview?: CourseReview | null;
}

export interface PublicCourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string | null;
  duration?: string | null;
  level?: string | null;
  highlights?: string[];
  learningObjectives?: string[];
  thumbnailUrl: string | null;
  priceCents: number;
  status: string;
  averageRating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  instructor: { id: string; fullName: string };
  category?: { id: string; name: string; slug: string } | null;
  modules?: CourseModulePreview[];
  access: CourseAccessInfo;
}
