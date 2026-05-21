'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  studentCount: number;
  instructorCount: number;
  publishedCourses: number;
  draftCourses: number;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--fg-3)]">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--fg)]">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-[var(--fg-4)] mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminStats>('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-[var(--fg-4)]">Loading…</p>;
  if (!stats) return <p className="text-sm text-[var(--rose)]">Failed to load stats.</p>;

  const revenueDisplay = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(stats.totalRevenue);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[var(--fg)]">Platform Overview</h1>
        <p className="text-sm text-[var(--fg-4)] mt-0.5">Real-time metrics across LearnBuild</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={stats.totalUsers}
          sub={`${stats.studentCount} students · ${stats.instructorCount} instructors`}
          icon={Users}
          color="bg-[var(--sky-soft)] text-[var(--sky)]"
        />
        <StatCard
          label="Total courses"
          value={stats.totalCourses}
          sub={`${stats.publishedCourses} published · ${stats.draftCourses} drafts`}
          icon={BookOpen}
          color="bg-[var(--teal-soft)] text-[var(--teal)]"
        />
        <StatCard
          label="Enrollments"
          value={stats.totalEnrollments}
          icon={GraduationCap}
          color="bg-[var(--violet)]/10 text-[var(--violet)]"
        />
        <StatCard
          label="Total revenue"
          value={revenueDisplay}
          icon={DollarSign}
          color="bg-[var(--amber-soft)] text-[var(--amber)]"
        />
      </div>
    </div>
  );
}
