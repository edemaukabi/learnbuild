import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/course/CourseCard';
import { CourseCard as CourseCardType } from '@/types';

async function getFeaturedCourses(): Promise<CourseCardType[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/featured`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse the catalog',
    description: 'Explore hundreds of courses across development, design, business, and more.',
  },
  {
    step: '02',
    title: 'Enroll and learn',
    description: 'Work through video lessons at your own pace, take quizzes, and track your progress.',
  },
  {
    step: '03',
    title: 'Earn your certificate',
    description: 'Complete a course to receive a verifiable certificate you can share anywhere.',
  },
];

const STATS = [
  { icon: BookOpen, value: '500+', label: 'Courses' },
  { icon: Users, value: '12,000+', label: 'Students' },
  { icon: Award, value: '8,400+', label: 'Certificates issued' },
];

export default async function HomePage() {
  const featured = await getFeaturedCourses();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[var(--sky)] opacity-[0.06] blur-[120px]" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--teal)] opacity-[0.05] blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-[var(--border-2)] bg-[var(--card)] text-xs text-[var(--fg-3)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)]" />
            New courses added every week
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-[var(--fg)] leading-[1.1] tracking-tight mb-6">
            Learn skills that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--sky)] to-[var(--teal)]">
              matter today
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--fg-3)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Expert-led courses in development, design, data, and more. Learn at your pace,
            earn certificates, and build the future you want.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/catalog">
              <Button size="lg" className="gap-2">
                Browse catalog
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="gap-2">
                <Play size={14} />
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 justify-center">
              <div className="w-9 h-9 rounded-lg bg-[var(--sky-soft)] flex items-center justify-center">
                <Icon size={18} className="text-[var(--sky)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--fg)]">{value}</p>
                <p className="text-xs text-[var(--fg-3)]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-medium text-[var(--sky)] uppercase tracking-widest mb-1">Featured</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">Handpicked for you</h2>
            </div>
            <Link href="/catalog" className="text-sm text-[var(--fg-3)] hover:text-[var(--fg)] transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-medium text-[var(--teal)] uppercase tracking-widest mb-1">Simple process</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">How LearnBuild works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="relative">
                <div className="text-5xl font-bold text-[var(--border-strong)] mb-4 select-none">{step}</div>
                <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--fg-3)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-4">
          Ready to start learning?
        </h2>
        <p className="text-[var(--fg-3)] mb-8 max-w-md mx-auto">
          Join thousands of learners already building their skills on LearnBuild.
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="gap-2">
            Create free account <ArrowRight size={16} />
          </Button>
        </Link>
      </section>
    </>
  );
}
