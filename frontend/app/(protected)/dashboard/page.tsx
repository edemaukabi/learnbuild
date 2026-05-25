'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Award,
  ArrowRight,
  Play,
  Clock,
  LucideIcon,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface DashboardEnrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    totalLessons: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface Certificate {
  id: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: string;
  course: {
    title: string;
    slug: string;
    coverImage: string | null;
  };
}

interface DashboardData {
  totalEnrolled: number;
  totalCertificates: number;
  enrollments: DashboardEnrollment[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<DashboardData>('/users/me/dashboard'),
      api.get<Certificate[]>('/certificates'),
    ])
      .then(([dashRes, certRes]) => {
        setData(dashRes.data);
        setCertificates(certRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const certsByCourseId = Object.fromEntries(certificates.map((c) => [c.courseId, c]));

  const refetchCerts = useCallback(() => {
    api.get<Certificate[]>('/certificates').then((r) => setCertificates(r.data)).catch(() => {});
  }, []);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-sm text-[var(--fg-3)]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--fg)]">My Learning</h1>
        <p className="text-sm text-[var(--fg-3)] mt-1">Welcome back, {user?.firstName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookOpen} value={String(data?.totalEnrolled ?? 0)} label="Courses enrolled" color="sky" />
        <StatCard icon={Award} value={String(data?.totalCertificates ?? 0)} label="Certificates earned" color="teal" />
        <StatCard
          icon={Play}
          value={String(data?.enrollments.filter((e) => e.progress.percentage > 0 && e.progress.percentage < 100).length ?? 0)}
          label="In progress"
          color="amber"
        />
        <StatCard
          icon={Clock}
          value={String(data?.enrollments.filter((e) => e.progress.percentage === 100).length ?? 0)}
          label="Completed"
          color="teal"
        />
      </div>

      {/* Enrolled courses */}
      {!data || data.enrollments.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">My courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.enrollments.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                certificate={certsByCourseId[enrollment.courseId] ?? null}
                onCertificateIssued={refetchCerts}
              />
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--fg)] mb-4">Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  color: 'sky' | 'teal' | 'amber';
}) {
  const bg = { sky: 'bg-[var(--sky-soft)]', teal: 'bg-[var(--teal-soft)]', amber: 'bg-[var(--amber-soft)]' }[color];
  const text = { sky: 'text-[var(--sky)]', teal: 'text-[var(--teal)]', amber: 'text-[var(--amber)]' }[color];
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={text} />
      </div>
      <p className="text-2xl font-bold text-[var(--fg)]">{value}</p>
      <p className="text-xs text-[var(--fg-3)] mt-0.5">{label}</p>
    </div>
  );
}

function EnrolledCourseCard({
  enrollment,
  certificate,
  onCertificateIssued,
}: {
  enrollment: DashboardEnrollment;
  certificate: Certificate | null;
  onCertificateIssued: () => void;
}) {
  const { course, progress } = enrollment;
  const isComplete = progress.percentage === 100;
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post(`/certificates/generate/${course.id}`);
      onCertificateIssued();
    } catch {
      // Already issued or not complete — refetch anyway
      onCertificateIssued();
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;
    setDownloading(true);
    try {
      const { data } = await api.get<{ url: string }>(`/certificates/${certificate.id}/download`);
      window.open(data.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-[var(--card-2)]">
        {course.coverImage ? (
          <Image src={course.coverImage} alt={course.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={28} className="text-[var(--fg-4)]" />
          </div>
        )}
        {isComplete && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-pill bg-[var(--teal)]/90 text-white text-[10px] font-semibold">
            Completed
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-[var(--fg)] leading-snug line-clamp-2">
          {course.title}
        </h3>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[var(--fg-4)]">
            <span>{progress.completed}/{progress.total} lessons</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--sky)] to-[var(--teal)] transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Link href={`/learn/${course.slug}`}>
            <Button variant={isComplete ? 'secondary' : 'primary'} size="sm" className="w-full gap-1.5">
              {isComplete ? 'Review course' : progress.percentage > 0 ? <>Continue <ArrowRight size={13} /></> : <>Start <Play size={13} /></>}
            </Button>
          </Link>

          {isComplete && !certificate && (
            <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleGenerate} disabled={generating}>
              {generating ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <><Award size={13} /> Get certificate</>}
            </Button>
          )}

          {isComplete && certificate && (
            <Button variant="ghost" size="sm" className="w-full gap-1.5 text-[var(--teal)]" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Download certificate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await api.get<{ url: string }>(`/certificates/${certificate.id}/download`);
      window.open(data.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--teal-edge)] bg-[var(--teal-soft)] p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-[var(--teal)] flex items-center justify-center shrink-0">
        <Award size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--fg)] line-clamp-2">{certificate.course.title}</p>
        <p className="text-xs text-[var(--fg-3)] mt-0.5">
          {new Date(certificate.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
        <p className="text-[10px] text-[var(--fg-4)] font-mono mt-0.5">{certificate.certificateNumber}</p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-2 flex items-center gap-1 text-xs text-[var(--teal)] hover:text-[var(--teal-2)] transition-colors disabled:opacity-50"
        >
          {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
          Download PDF
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--sky-soft)] flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-[var(--sky)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">No courses yet</h3>
      <p className="text-sm text-[var(--fg-3)] max-w-xs mb-6">
        Browse the catalog and enroll in your first course to get started.
      </p>
      <Link href="/catalog">
        <Button className="gap-2">Browse catalog <ArrowRight size={14} /></Button>
      </Link>
    </div>
  );
}
