'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { Category } from '@/types';

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  coverImage: string | null;
  categoryId: string | null;
  level: string;
  language: string;
  price: string;
  requirements: string[];
  learningOutcomes: string[];
  tags: string[];
}

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

export default function InfoTab({
  course,
  categories,
  onSaved,
}: {
  course: CourseInfo;
  categories: Category[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    coverImage: course.coverImage ?? '',
    categoryId: course.categoryId ?? '',
    level: course.level,
    language: course.language,
    price: course.price,
    requirements: course.requirements.join('\n'),
    learningOutcomes: course.learningOutcomes.join('\n'),
    tags: course.tags.join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/courses/${course.id}`, {
        title: form.title,
        shortDescription: form.shortDescription,
        description: form.description,
        coverImage: form.coverImage || null,
        categoryId: form.categoryId || null,
        level: form.level,
        language: form.language,
        price: parseFloat(form.price) || 0,
        requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
        learningOutcomes: form.learningOutcomes.split('\n').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Course title *</label>
          <Input value={form.title} onChange={set('title')} required />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Short description</label>
          <Input value={form.shortDescription} onChange={set('shortDescription')} placeholder="One sentence summary shown on the course card" />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Full description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={5}
            placeholder="Detailed course description…"
            className="w-full rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:border-[var(--sky)] focus:outline-none resize-none transition-[border-color] duration-[var(--t)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Cover image URL</label>
          <Input value={form.coverImage} onChange={set('coverImage')} placeholder="https://…" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Price (NGN)</label>
          <Input type="number" min="0" step="100" value={form.price} onChange={set('price')} placeholder="0 for free" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Category</label>
          <select
            value={form.categoryId}
            onChange={set('categoryId')}
            className="w-full h-9 rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 text-sm text-[var(--fg)] focus:border-[var(--sky)] focus:outline-none transition-[border-color] duration-[var(--t)]"
          >
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Language</label>
          <Input value={form.language} onChange={set('language')} placeholder="English" />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-[var(--fg-2)]">Level</label>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setForm((f) => ({ ...f, level: l }))}
                className={`flex-1 py-2 rounded-md text-xs font-medium border transition-all ${
                  form.level === l
                    ? 'bg-[var(--sky-soft)] border-[var(--sky-edge)] text-[var(--sky)]'
                    : 'border-[var(--border-2)] text-[var(--fg-3)] hover:border-[var(--border-strong)]'
                }`}
              >
                {l[0] + l.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Learning outcomes <span className="text-[var(--fg-4)]">(one per line)</span></label>
          <textarea
            value={form.learningOutcomes}
            onChange={set('learningOutcomes')}
            rows={4}
            placeholder="Build full-stack React apps&#10;Deploy to production&#10;…"
            className="w-full rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:border-[var(--sky)] focus:outline-none resize-none transition-[border-color] duration-[var(--t)]"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Requirements <span className="text-[var(--fg-4)]">(one per line)</span></label>
          <textarea
            value={form.requirements}
            onChange={set('requirements')}
            rows={3}
            placeholder="Basic JavaScript knowledge&#10;…"
            className="w-full rounded-md border border-[var(--border-2)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:border-[var(--sky)] focus:outline-none resize-none transition-[border-color] duration-[var(--t)]"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-2)]">Tags <span className="text-[var(--fg-4)]">(comma-separated)</span></label>
          <Input value={form.tags} onChange={set('tags')} placeholder="react, typescript, web development" />
        </div>
      </div>

      {error && <p className="text-xs text-[var(--rose)] bg-[var(--rose)]/10 border border-[var(--rose)]/20 rounded-md px-3 py-2">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
