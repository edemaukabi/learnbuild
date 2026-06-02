'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { Category } from '@/types';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export default function NewCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<string>('BEGINNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Category[]>('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ id: string }>('/courses', {
        title: title.trim(),
        categoryId: categoryId || undefined,
        level,
        description: '',
        shortDescription: '',
        price: 0,
      });
      router.push(`/instructor/courses/${data.id}/edit`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link href="/instructor" className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors mb-8">
        <ArrowLeft size={14} /> Back
      </Link>

      <h1 className="text-2xl font-bold text-[var(--fg)] mb-2">Create a new course</h1>
      <p className="text-sm text-[var(--fg-3)] mb-8">
        Enter the basics — you can fill in all the details in the editor.
      </p>

      <form onSubmit={handleCreate} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Course title *</label>
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (error && !e.target.value.trim()) return; if (error) setError(''); }}
            placeholder="e.g. Complete React Developer Course"
            className={error && !title.trim() ? 'border-[var(--rose)] focus:border-[var(--rose)]' : ''}
          />
          {error && !title.trim() && (
            <p className="flex items-center gap-1 text-xs text-[var(--rose)] mt-1">
              <AlertCircle size={12} className="shrink-0" /> {error}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-9 rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 text-sm text-[var(--fg)] focus:border-[var(--sky)] focus:outline-none transition-[border-color] duration-[var(--t)]"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Level</label>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-md text-xs font-medium border transition-all ${
                  level === l
                    ? 'bg-[var(--sky-soft)] border-[var(--sky-edge)] text-[var(--sky)]'
                    : 'border-[var(--border-2)] text-[var(--fg-3)] hover:border-[var(--border-strong)]'
                }`}
              >
                {l[0] + l.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-[var(--rose)] bg-[var(--rose)]/10 border border-[var(--rose)]/20 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Create and go to editor'}
        </Button>
      </form>
    </div>
  );
}
