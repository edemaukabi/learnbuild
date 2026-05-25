'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  status: CourseStatus;
  price: string;
  totalStudents: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  instructor: { firstName: string; lastName: string; email: string };
  category: { name: string } | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_COLORS: Record<CourseStatus, string> = {
  PUBLISHED: 'bg-[var(--teal-soft)] text-[var(--teal)]',
  DRAFT: 'bg-[var(--amber-soft)] text-[var(--amber)]',
  ARCHIVED: 'bg-[var(--border)] text-[var(--fg-3)]',
};

const STATUSES: CourseStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminCourse | null>(null);

  const fetchCourses = useCallback(async (p: number, q: string, s: CourseStatus | '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (q) params.set('search', q);
      if (s) params.set('status', s);
      const res = await api.get<{ data: AdminCourse[]; meta: Meta }>(`/admin/courses?${params}`);
      setCourses(res.data.data);
      setMeta(res.data.meta);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourses(1, '', ''); }, [fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses(1, search, statusFilter);
  };

  const handleStatusChange = async (courseId: string, status: CourseStatus) => {
    setUpdatingId(courseId);
    try {
      await api.patch(`/admin/courses/${courseId}/status`, { status });
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, status } : c));
    } catch {
      //
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    await api.delete(`/admin/courses/${pendingDelete.id}`);
    setCourses((prev) => prev.filter((c) => c.id !== pendingDelete.id));
    if (meta) setMeta({ ...meta, total: meta.total - 1 });
    setPendingDelete(null);
  };

  const colSpan = 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--fg)]">Courses</h1>
          {meta && <p className="text-sm text-[var(--fg-4)] mt-0.5">{meta.total.toLocaleString()} total</p>}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CourseStatus | '')}
            className="h-8 rounded border border-[var(--border-2)] bg-[var(--card)] px-2 text-xs text-[var(--fg)] focus:border-[var(--sky)] focus:outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title…"
              className="pl-8 w-48 h-8 text-sm"
            />
          </div>
          <Button type="submit" className="h-8 text-sm px-3">Filter</Button>
        </form>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--fg-4)]">Override status</th>
                <th className="px-4 py-3" />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-[var(--fg-4)]">Loading…</td></tr>
              ) : courses.length === 0 ? (
                <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-[var(--fg-4)]">No courses found</td></tr>
              ) : courses.map((c) => (
                <tr key={c.id} className="bg-[var(--surface)] hover:bg-[var(--card)] transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-[var(--fg)] truncate">{c.title}</p>
                    <p className="text-xs text-[var(--fg-4)]">
                      {c.instructor.firstName} {c.instructor.lastName}
                      {c.category ? ` · ${c.category.name}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--fg-3)]">{formatPrice(c.price)}</td>
                  <td className="px-4 py-3 text-[var(--fg-3)]">{c.totalStudents.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value as CourseStatus)}
                      disabled={updatingId === c.id}
                      className="h-7 rounded border border-[var(--border-2)] bg-[var(--card)] px-2 text-xs text-[var(--fg)] focus:border-[var(--sky)] focus:outline-none disabled:opacity-50"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/catalog/${c.slug}`}
                      target="_blank"
                      className="text-[var(--fg-4)] hover:text-[var(--fg)] transition-colors"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPendingDelete(c)}
                      className="p-1.5 rounded-md text-[var(--fg-4)] hover:text-[var(--rose)] hover:bg-[var(--rose)]/10 transition-colors"
                      title="Delete course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            className="h-8 text-sm px-3"
            disabled={page === 1}
            onClick={() => { const p = page - 1; setPage(p); fetchCourses(p, search, statusFilter); }}
          >
            Previous
          </Button>
          <span className="text-xs text-[var(--fg-4)]">Page {page} of {meta.totalPages}</span>
          <Button
            variant="outline"
            className="h-8 text-sm px-3"
            disabled={page === meta.totalPages}
            onClick={() => { const p = page + 1; setPage(p); fetchCourses(p, search, statusFilter); }}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete course"
        description={pendingDelete ? `Are you sure you want to delete "${pendingDelete.title}"?` : ''}
        details={pendingDelete ? `${pendingDelete.totalStudents} enrolled student${pendingDelete.totalStudents !== 1 ? 's' : ''} will immediately lose access. All course data including sections, lessons, reviews, and enrollments will be permanently removed. This action cannot be undone.` : ''}
        confirmLabel="Delete course"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
