'use client';

import { useState } from 'react';
import { Globe, Archive, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface CourseBasic {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export default function PublishTab({
  course,
  onStatusChanged,
}: {
  course: CourseBasic;
  onStatusChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/courses/${course.id}/publish`);
      onStatusChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to publish course');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/courses/${course.id}`);
      onStatusChanged();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to archive course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Status card */}
      <div className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${
        course.status === 'PUBLISHED'
          ? 'bg-[var(--teal-soft)] border-[var(--teal-edge)]'
          : course.status === 'ARCHIVED'
            ? 'bg-[var(--border)] border-[var(--border-2)]'
            : 'bg-[var(--amber-soft)] border-[var(--amber-edge)]'
      }`}>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          course.status === 'PUBLISHED' ? 'bg-[var(--teal)]'
          : course.status === 'ARCHIVED' ? 'bg-[var(--fg-4)]'
          : 'bg-[var(--amber)]'
        }`} />
        <div>
          <p className="text-sm font-semibold text-[var(--fg)]">
            {course.status === 'PUBLISHED' ? 'This course is live'
             : course.status === 'ARCHIVED' ? 'This course is archived'
             : 'This course is a draft'}
          </p>
          <p className="text-xs text-[var(--fg-3)] mt-0.5">
            {course.status === 'PUBLISHED'
              ? 'Students can enroll and access all content.'
              : course.status === 'ARCHIVED'
                ? 'No new enrollments allowed. Existing students retain access.'
                : 'Only you can see this course. Publish to make it available.'}
          </p>
        </div>
      </div>

      {/* Publish action */}
      {course.status !== 'PUBLISHED' && (
        <div className="rounded-xl border border-[var(--border-2)] bg-[var(--card)] p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Globe size={18} className="text-[var(--sky)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">Publish this course</h3>
              <p className="text-xs text-[var(--fg-3)] mt-1 leading-relaxed">
                Publishing makes the course visible in the catalog and allows students to enroll.
                Make sure you&apos;ve added at least one section with lessons before publishing.
              </p>
            </div>
          </div>

          <div className="bg-[var(--sky-soft)] border border-[var(--sky-edge)] rounded-lg px-4 py-3 space-y-1.5">
            <p className="text-xs font-medium text-[var(--sky)]">Before publishing, confirm:</p>
            <ul className="text-xs text-[var(--fg-2)] space-y-1 list-disc list-inside">
              <li>Course title and description are complete</li>
              <li>At least one section and lesson exist</li>
              <li>Price is set correctly (0 = free)</li>
              <li>Cover image is uploaded</li>
            </ul>
          </div>

          <Button onClick={handlePublish} disabled={loading} className="flex items-center gap-2">
            <Globe size={14} />
            {loading ? 'Publishing…' : 'Publish course'}
          </Button>
        </div>
      )}

      {/* Already published info */}
      {course.status === 'PUBLISHED' && (
        <div className="rounded-xl border border-[var(--border-2)] bg-[var(--card)] p-5 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-[var(--teal)] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--fg)]">Course is live</h3>
            <p className="text-xs text-[var(--fg-3)] mt-1 leading-relaxed">
              Students can find and enroll in this course from the catalog. Changes you make to
              the info or curriculum are reflected immediately.
            </p>
          </div>
        </div>
      )}

      {/* Archive action */}
      {course.status !== 'ARCHIVED' && (
        <div className="rounded-xl border border-[var(--border-2)] bg-[var(--card)] p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Archive size={18} className="text-[var(--fg-3)] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">Archive this course</h3>
              <p className="text-xs text-[var(--fg-3)] mt-1 leading-relaxed">
                Archiving removes the course from the catalog. Students already enrolled keep
                their access, but no new enrollments are allowed.
              </p>
            </div>
          </div>

          <div className="bg-[var(--amber-soft)] border border-[var(--amber-edge)] rounded-lg px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={13} className="text-[var(--amber)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--amber-2)]">
              This action can be undone by publishing the course again.
            </p>
          </div>

          <Button
            onClick={handleArchive}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 border-[var(--border-2)] text-[var(--fg-3)] hover:text-[var(--fg)]"
          >
            <Archive size={14} />
            {loading ? 'Archiving…' : 'Archive course'}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-[var(--rose)] bg-[var(--rose)]/10 border border-[var(--rose)]/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
