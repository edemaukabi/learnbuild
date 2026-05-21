import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Users, Clock, BookOpen, Globe, ChevronDown, Play, Lock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EnrollButton from '@/components/course/EnrollButton';
import ReviewSection from '@/components/course/ReviewSection';
import { CourseDetail, Section } from '@/types';
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

async function getCourse(slug: string): Promise<CourseDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getCurriculum(slug: string): Promise<Section[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${slug}/curriculum`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Course Not Found — LearnBuild' };
  return {
    title: `${course.title} — LearnBuild`,
    description: course.shortDescription,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [course, sections] = await Promise.all([getCourse(slug), getCurriculum(slug)]);

  if (!course) notFound();

  const totalDurationDisplay = formatDuration(course.totalDuration);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={LEVEL_VARIANT[course.level] ?? 'default'}>
              {LEVEL_LABEL[course.level]}
            </Badge>
            {course.category && <Badge variant="default">{course.category.name}</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)] leading-snug mb-3">
            {course.title}
          </h1>

          <p className="text-[var(--fg-3)] mb-5 leading-relaxed">{course.shortDescription}</p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--fg-3)] mb-6">
            {course.averageRating > 0 && (
              <span className="flex items-center gap-1 text-[var(--amber)]">
                <Star size={14} fill="currentColor" />
                <span className="font-medium">{formatRating(course.averageRating)}</span>
                <span className="text-[var(--fg-4)]">({course.totalReviews} reviews)</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={14} />
              {course.totalStudents.toLocaleString()} students
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {totalDurationDisplay}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {course.totalLessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Globe size={14} />
              {course.language}
            </span>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[var(--border)]">
            {course.instructor.avatar ? (
              <Image
                src={course.instructor.avatar}
                alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--card-2)] flex items-center justify-center text-sm font-medium text-[var(--fg-2)]">
                {course.instructor.firstName[0]}
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--fg-4)]">Created by</p>
              <p className="text-sm font-medium text-[var(--fg)]">
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
            </div>
          </div>

          {/* What you'll learn */}
          {course.learningOutcomes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.learningOutcomes.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[var(--fg-2)]">
                    <CheckCircle size={14} className="text-[var(--teal)] mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Requirements */}
          {course.requirements.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Requirements</h2>
              <ul className="space-y-1.5 text-sm text-[var(--fg-2)]">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[var(--fg-4)] mt-0.5">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Description */}
          {course.description && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">About this course</h2>
              <div className="text-sm text-[var(--fg-2)] leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </section>
          )}

          {/* Curriculum */}
          {sections.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Curriculum</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <details key={section.id} className="group border border-[var(--border)] rounded-lg overflow-hidden">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-[var(--card)] hover:bg-[var(--card-2)] transition-colors">
                      <span className="text-sm font-medium text-[var(--fg)]">{section.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--fg-4)]">{section.lessons.length} lessons</span>
                        <ChevronDown size={15} className="text-[var(--fg-4)] transition-transform group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="divide-y divide-[var(--border)]">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 bg-[var(--surface)]">
                          {lesson.isPreview ? (
                            <Play size={13} className="text-[var(--sky)] shrink-0" />
                          ) : (
                            <Lock size={13} className="text-[var(--fg-4)] shrink-0" />
                          )}
                          <span className="text-sm text-[var(--fg-2)] flex-1">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-xs text-[var(--fg-4)]">
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Instructor bio */}
          {course.instructor.bio && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Your instructor</h2>
              <div className="flex items-start gap-4">
                {course.instructor.avatar ? (
                  <Image
                    src={course.instructor.avatar}
                    alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                    width={64}
                    height={64}
                    className="rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[var(--card-2)] flex items-center justify-center text-lg font-medium text-[var(--fg-2)] shrink-0">
                    {course.instructor.firstName[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-[var(--fg)]">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  {course.instructor.instructorProfile?.headline && (
                    <p className="text-sm text-[var(--fg-3)] mb-2">{course.instructor.instructorProfile.headline}</p>
                  )}
                  <p className="text-sm text-[var(--fg-2)] leading-relaxed">{course.instructor.bio}</p>
                </div>
              </div>
            </section>
          )}

          {/* Reviews */}
          <ReviewSection
            courseId={course.id}
            averageRating={course.averageRating}
            totalReviews={course.totalReviews}
          />
        </div>

        {/* Sticky sidebar */}
        <aside className="w-full lg:w-[340px] shrink-0">
          <div className="sticky top-20 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            {/* Cover */}
            {course.coverImage ? (
              <div className="relative aspect-video">
                <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-[var(--card-2)] flex items-center justify-center">
                <BookOpen size={40} className="text-[var(--fg-4)]" />
              </div>
            )}

            <div className="p-5">
              <p className="text-2xl font-bold text-[var(--fg)] mb-1">{formatPrice(course.price)}</p>
              <EnrollButton courseId={course.id} price={course.price} slug={course.slug} />

              <div className="mt-4 space-y-2 text-sm text-[var(--fg-3)]">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-[var(--fg)]">{totalDurationDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span className="text-[var(--fg)]">{course.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level</span>
                  <span className="text-[var(--fg)]">{LEVEL_LABEL[course.level]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language</span>
                  <span className="text-[var(--fg)]">{course.language}</span>
                </div>
                <div className="flex justify-between">
                  <span>Students</span>
                  <span className="text-[var(--fg)]">{course.totalStudents.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
