export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  avatar: string | null;
  bio?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface CourseCard {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string | null;
  price: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  averageRating: number;
  totalStudents: number;
  totalReviews: number;
  totalLessons: number;
  totalDuration: number;
  isFeatured: boolean;
  category: { name: string; slug: string } | null;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface CourseDetail extends CourseCard {
  description: string;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
  language: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  instructor: CourseCard['instructor'] & {
    bio: string | null;
    instructorProfile: {
      headline: string | null;
      totalStudents: number;
      averageRating: number;
    } | null;
  };
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
  duration: number | null;
  isPreview: boolean;
  videoId?: string | null;
  content?: string | null;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
