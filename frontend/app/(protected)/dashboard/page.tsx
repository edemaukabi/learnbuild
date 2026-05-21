'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Award, ArrowRight, Play, Clock, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface DashboardEnrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  paymentStatus: string;
  course: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    totalLessons: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface DashboardData {
  totalEnrolled: number;
  totalCertificates: number;
  enrollments: DashboardEnrollment[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get<DashboardData>('/users/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-sm text-[var(--fg-3)]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">
          My Learning
        </h1>
        <p className="text-sm text-[var(--fg-3)] mt-1">
          Welcome back, {user?.firstName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={BookOpen}
          value={String(data?.totalEnrolled ?? 0)}
          label="Courses enrolled"
          color="sky"
        />
        <StatCard
          icon={Award}
          value={String(data?.totalCertificates ?? 0)}
          label="Certificates earned"
          color="teal"
        />
        <StatCard
          icon={Play}
          value={String(
            data?.enrollments.filter((e) => e.progress.percentage > 0 && e.progress.percentage < 100).length ?? 0
          )}
          label="In progress"
          color="amber"
        />
        <StatCard
          icon={Clock}
          value={String(
            data?.enrollments.filter((e) => e.progress.percentage === 100).length ?? 0
          )}
          label="Completed"
          color="teal"
        />
      </div>

      {/* Enrolled courses */}
      {!data || data.enrollments.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">My courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.enrollments.map((enrollment) => (
              <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  color: 'sky' | 'teal' | 'amber';
}) {
  const bg = {
    sky: 'bg-[var(--sky-soft)]',
    teal: 'bg-[var(--teal-soft)]',
    amber: 'bg-[var(--amber-soft)]',
  }[color];
  const text = {
    sky: 'text-[var(--sky)]',
    teal: 'text-[var(--teal)]',
    amber: 'text-[var(--amber)]',
  }[color];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={text} />
      </div>
      <p className="text-2xl font-bold text-[var(--fg)]">{value}</p>
      <p className="text-xs text-[var(--fg-3)] mt-0.5">{label}</p>
    </div>
  );
}

function EnrolledCourseCard({ enrollment }: { enrollment: DashboardEnrollment }) {
  const { course, progress } = enrollment;
  const isComplete = progress.percentage === 100;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex flex-col">
      {/* Cover */}
      <div className="relative aspect-video bg-[var(--card-2)]">
        {course.coverImage ? (
          <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={28} className="text-[var(--fg-4)]" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-[var(--fg)] leading-snug line-clamp-2">
          {course.title}
        </h3>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[var(--fg-4)]">
            <span>{progress.completed}/{progress.total} lessons</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--sky)] to-[var(--teal)] transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-auto">
          <Link href={`/learn/${course.slug}`}>
            <Button variant={isComplete ? 'secondary' : 'primary'} size="sm" className="w-full gap-1.5">
              {isComplete ? (
                <>View certificate</>
              ) : progress.percentage > 0 ? (
                <>Continue <ArrowRight size={13} /></>
              ) : (
                <>Start learning <Play size={13} /></>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--sky-soft)] flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-[var(--sky)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">No courses yet</h3>
      <p className="text-sm text-[var(--fg-3)] max-w-xs mb-6">
        Browse the catalog and enroll in your first course to get started.
      </p>
      <Link href="/catalog">
        <Button className="gap-2">
          Browse catalog <ArrowRight size={14} />
        </Button>
      </Link>
    </div>
  );
}
