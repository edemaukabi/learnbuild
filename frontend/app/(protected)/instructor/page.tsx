'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, BookOpen, Users, DollarSign, TrendingUp, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalStudents: number;
  totalLessons: number;
  price: string;
  averageRating: number;
  totalReviews: number;
}

interface Stats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
}

const STATUS_VARIANT: Record<string, 'teal' | 'amber' | 'default'> = {
  PUBLISHED: 'teal',
  DRAFT: 'amber',
  ARCHIVED: 'default',
};

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<InstructorCourse[]>('/courses/instructor/me'),
      api.get<Stats>('/instructor/stats'),
    ])
      .then(([coursesRes, statsRes]) => {
        setCourses(coursesRes.data);
        setStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <span className="text-sm text-[var(--fg-3)]">Loading…</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">Instructor Studio</h1>
          <p className="text-sm text-[var(--fg-3)] mt-1">Manage your courses and track performance</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button className="gap-2">
            <Plus size={15} /> New course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: BookOpen, label: 'Total courses', value: String(stats?.totalCourses ?? 0), color: 'sky' },
          { icon: TrendingUp, label: 'Published', value: String(stats?.publishedCourses ?? 0), color: 'teal' },
          { icon: Users, label: 'Total students', value: (stats?.totalStudents ?? 0).toLocaleString(), color: 'amber' },
          { icon: DollarSign, label: 'Revenue', value: formatPrice(String(stats?.totalRevenue ?? 0)), color: 'teal' },
        ].map(({ icon: Icon, label, value, color }) => {
          const bg = { sky: 'bg-[var(--sky-soft)]', teal: 'bg-[var(--teal-soft)]', amber: 'bg-[var(--amber-soft)]' }[color as string] ?? '';
          const text = { sky: 'text-[var(--sky)]', teal: 'text-[var(--teal)]', amber: 'text-[var(--amber)]' }[color as string] ?? '';
          return (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={text} />
              </div>
              <p className="text-2xl font-bold text-[var(--fg)]">{value}</p>
              <p className="text-xs text-[var(--fg-3)] mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Course list */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--sky-soft)] flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-[var(--sky)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">No courses yet</h3>
          <p className="text-sm text-[var(--fg-3)] max-w-xs mb-6">
            Create your first course and start sharing your knowledge.
          </p>
          <Link href="/instructor/courses/new">
            <Button className="gap-2"><Plus size={14} /> Create course</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Your courses</h2>
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-14 rounded-md overflow-hidden bg-[var(--card-2)] shrink-0">
                {course.coverImage ? (
                  <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={16} className="text-[var(--fg-4)]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-[var(--fg)] truncate">{course.title}</h3>
                  <Badge variant={STATUS_VARIANT[course.status] ?? 'default'}>
                    {course.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--fg-3)]">
                  <span><span className="text-[var(--fg)]">{course.totalStudents.toLocaleString()}</span> students</span>
                  <span><span className="text-[var(--fg)]">{course.totalLessons}</span> lessons</span>
                  <span className="text-[var(--fg)]">{formatPrice(course.price)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/catalog/${course.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Eye size={13} /> Preview
                  </Button>
                </Link>
                <Link href={`/instructor/courses/${course.id}/edit`}>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <Edit size={13} /> Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
