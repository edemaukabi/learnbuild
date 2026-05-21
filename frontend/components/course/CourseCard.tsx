import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CourseCard as CourseCardType } from '@/types';
import { formatPrice, formatDuration, formatRating } from '@/lib/utils';

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const LEVEL_VARIANT: Record<string, 'sky' | 'teal' | 'amber'> = {
  BEGINNER: 'teal',
  INTERMEDIATE: 'sky',
  ADVANCED: 'amber',
};

export default function CourseCard({ course }: { course: CourseCardType }) {
  return (
    <Link
      href={`/catalog/${course.slug}`}
      className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--border-strong)] transition-all duration-[var(--t)] hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="relative aspect-video bg-[var(--card-2)] overflow-hidden">
        {course.coverImage ? (
          <Image
            src={course.coverImage}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-[var(--t-slow)] group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={32} className="text-[var(--fg-4)]" />
          </div>
        )}
        {/* Price pill */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-0.5 rounded-pill text-xs font-semibold bg-[var(--surface)]/90 backdrop-blur-sm text-[var(--fg)]">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center gap-1.5">
          <Badge variant={LEVEL_VARIANT[course.level] ?? 'default'}>
            {LEVEL_LABEL[course.level]}
          </Badge>
          {course.category && (
            <Badge variant="default">{course.category.name}</Badge>
          )}
        </div>

        <h3 className="text-sm font-semibold text-[var(--fg)] leading-snug line-clamp-2 group-hover:text-[var(--sky-2)] transition-colors duration-[var(--t)]">
          {course.title}
        </h3>

        <p className="text-xs text-[var(--fg-3)] line-clamp-2 flex-1">
          {course.shortDescription}
        </p>

        {/* Instructor */}
        <p className="text-xs text-[var(--fg-3)]">
          {course.instructor.firstName} {course.instructor.lastName}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-1 border-t border-[var(--border)] text-xs text-[var(--fg-3)]">
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1 text-[var(--amber)]">
              <Star size={11} fill="currentColor" />
              {formatRating(course.averageRating)}
              <span className="text-[var(--fg-4)]">({course.totalReviews})</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={11} />
            {course.totalStudents.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDuration(course.totalDuration)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <BookOpen size={11} />
            {course.totalLessons}
          </span>
        </div>
      </div>
    </Link>
  );
}
