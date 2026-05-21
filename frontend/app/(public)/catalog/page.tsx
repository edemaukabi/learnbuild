import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CourseCard from '@/components/course/CourseCard';
import CatalogFilters from '@/components/course/CatalogFilters';
import { CourseCard as CourseCardType, Category, PaginatedResponse } from '@/types';

interface SearchParams {
  category?: string;
  level?: string;
  search?: string;
  sort?: string;
  page?: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCourses(params: SearchParams): Promise<PaginatedResponse<CourseCardType>> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.level) qs.set('level', params.level);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', params.page);
  qs.set('limit', '9');

  const empty: PaginatedResponse<CourseCardType> = {
    data: [],
    meta: { total: 0, page: 1, limit: 9, totalPages: 1 },
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses?${qs.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

export const metadata = {
  title: 'Course Catalog — LearnBuild',
  description: 'Browse expert-led courses in development, design, data, and more.',
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1', 10);

  const [categories, result] = await Promise.all([
    getCategories(),
    getCourses(params),
  ]);

  const { data: courses, meta: { total, totalPages } } = result;

  const buildPageUrl = (p: number) => {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.level) qs.set('level', params.level);
    if (params.search) qs.set('search', params.search);
    if (params.sort) qs.set('sort', params.sort);
    qs.set('page', String(p));
    return `/catalog?${qs.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">Course Catalog</h1>
        <p className="text-sm text-[var(--fg-3)] mt-1">
          {total.toLocaleString()} course{total !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <Suspense>
            <CatalogFilters
              categories={categories}
              currentCategory={params.category}
              currentLevel={params.level}
              currentSort={params.sort}
              currentSearch={params.search}
            />
          </Suspense>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-[var(--fg-2)] font-medium mb-1">No courses found</p>
              <p className="text-sm text-[var(--fg-3)]">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={buildPageUrl(page - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-all"
                    >
                      <ChevronLeft size={15} />
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-[var(--fg-4)] text-sm">…</span>
                      ) : (
                        <Link
                          key={p}
                          href={buildPageUrl(p as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all ${
                            p === page
                              ? 'bg-[var(--sky)] text-white font-medium'
                              : 'border border-[var(--border)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          {p}
                        </Link>
                      )
                    )}

                  {page < totalPages && (
                    <Link
                      href={buildPageUrl(page + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--fg-3)] hover:text-[var(--fg)] hover:border-[var(--border-strong)] transition-all"
                    >
                      <ChevronRight size={15} />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
