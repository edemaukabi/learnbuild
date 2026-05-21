'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count: { courses: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    api.get<Category[]>('/admin/categories')
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.post('/admin/categories', { name: name.trim(), icon: icon.trim() || undefined });
      setName('');
      setIcon('');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Courses in this category will become uncategorised.`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      //
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-[var(--fg)]">Categories</h1>
        <p className="text-sm text-[var(--fg-4)] mt-0.5">Manage course categories shown in the catalog</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
        <p className="text-sm font-semibold text-[var(--fg)]">Add category</p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-3)]">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Web Development" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--fg-3)]">Icon (emoji or URL)</label>
          <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="💻" />
        </div>
        {error && <p className="text-xs text-[var(--rose)]">{error}</p>}
        <Button type="submit" disabled={creating} className="flex items-center gap-2">
          <Plus size={14} />
          {creating ? 'Creating…' : 'Create category'}
        </Button>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-sm text-[var(--fg-4)]">Loading…</p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
          {categories.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--fg-4)]">No categories yet.</p>
          ) : categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-4 py-3 bg-[var(--surface)] hover:bg-[var(--card)] transition-colors">
              <div className="flex items-center gap-3">
                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                <div>
                  <p className="text-sm font-medium text-[var(--fg)]">{cat.name}</p>
                  <p className="text-xs text-[var(--fg-4)]">{cat._count.courses} course{cat._count.courses !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                className="text-[var(--fg-4)] hover:text-[var(--rose)] transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
