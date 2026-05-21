'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import api from '@/lib/api';
import { Category } from '@/types';
import InfoTab from './InfoTab';
import CurriculumTab from './CurriculumTab';
import PublishTab from './PublishTab';

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImage: string | null;
  categoryId: string | null;
  level: string;
  language: string;
  price: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
}

const TABS = ['Info', 'Curriculum', 'Publish'] as const;
type Tab = typeof TABS[number];

export default function CourseEditorShell({ courseId }: { courseId: string }) {
  const [tab, setTab] = useState<Tab>('Info');
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CourseDetail>(`/courses/${courseId}`).catch(() => api.get<CourseDetail>(`/courses/${courseId}`)),
      api.get<Category[]>('/categories'),
    ])
      .then(([courseRes, catRes]) => {
        setCourse(courseRes.data);
        setCategories(catRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const refreshCourse = () => {
    api.get<CourseDetail>(`/courses/${courseId}`).then((r) => setCourse(r.data)).catch(() => {});
  };

  if (loading || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <span className="text-sm text-[var(--fg-3)]">{loading ? 'Loading…' : 'Course not found'}</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/instructor" className="text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[var(--fg)] line-clamp-1">{course.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                course.status === 'PUBLISHED'
                  ? 'bg-[var(--teal-soft)] text-[var(--teal)]'
                  : course.status === 'ARCHIVED'
                    ? 'bg-[var(--border)] text-[var(--fg-3)]'
                    : 'bg-[var(--amber-soft)] text-[var(--amber)]'
              }`}>
                {course.status}
              </span>
            </div>
          </div>
        </div>
        <Link href={`/catalog/${course.slug}`} target="_blank">
          <span className="flex items-center gap-1.5 text-xs text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors">
            <Eye size={13} /> Preview
          </span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--border)] mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === t
                ? 'border-[var(--sky)] text-[var(--sky)]'
                : 'border-transparent text-[var(--fg-3)] hover:text-[var(--fg)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Info' && (
        <InfoTab course={course} categories={categories} onSaved={refreshCourse} />
      )}
      {tab === 'Curriculum' && (
        <CurriculumTab courseId={courseId} />
      )}
      {tab === 'Publish' && (
        <PublishTab course={course} onStatusChanged={refreshCourse} />
      )}
    </div>
  );
}
