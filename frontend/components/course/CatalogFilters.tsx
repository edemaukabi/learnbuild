'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Category } from '@/types';
import { useState, useTransition } from 'react';

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

interface Props {
  categories: Category[];
  currentCategory?: string;
  currentLevel?: string;
  currentSort?: string;
  currentSearch?: string;
}

export default function CatalogFilters({
  categories,
  currentCategory,
  currentLevel,
  currentSort,
  currentSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch ?? '');

  const update = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAll = () => {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = currentCategory || currentLevel || currentSearch || currentSort;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update('search', search || undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-4)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full h-9 pl-8 pr-3 rounded-md border border-[var(--border-2)] bg-[var(--card)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-3)] focus:border-[var(--sky)] focus:outline-none transition-[border-color] duration-[var(--t)]"
        />
      </form>

      {/* Sort */}
      <div>
        <p className="text-xs font-medium text-[var(--fg-2)] mb-2 uppercase tracking-wider">Sort by</p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('sort', opt.value === currentSort ? undefined : opt.value)}
              className={`text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                opt.value === currentSort
                  ? 'text-[var(--sky)] bg-[var(--sky-soft)]'
                  : 'text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--card-2)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <p className="text-xs font-medium text-[var(--fg-2)] mb-2 uppercase tracking-wider">Level</p>
        <div className="flex flex-col gap-1">
          {LEVELS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('level', opt.value === currentLevel ? undefined : opt.value)}
              className={`text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                opt.value === currentLevel
                  ? 'text-[var(--sky)] bg-[var(--sky-soft)]'
                  : 'text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--card-2)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--fg-2)] mb-2 uppercase tracking-wider">Category</p>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => update('category', cat.slug === currentCategory ? undefined : cat.slug)}
                className={`text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                  cat.slug === currentCategory
                    ? 'text-[var(--sky)] bg-[var(--sky-soft)]'
                    : 'text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--card-2)]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs text-[var(--fg-3)] hover:text-[var(--rose)] transition-colors"
        >
          <X size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}
