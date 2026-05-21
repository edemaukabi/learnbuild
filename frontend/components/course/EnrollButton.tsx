'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Props {
  courseId: string;
  price: string;
  slug: string;
}

export default function EnrollButton({ courseId, price, slug }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const isFree = parseFloat(price) === 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) return;
    setChecking(true);
    api
      .get<{ enrolled: boolean }>(`/enrollments/check/${courseId}`)
      .then((res) => setEnrolled(res.data.enrolled))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [user, courseId]);

  if (checking) {
    return <Button className="w-full" size="lg" disabled>Checking…</Button>;
  }

  if (enrolled) {
    return (
      <Link href={`/learn/${slug}`} className="block">
        <Button className="w-full" size="lg" variant="secondary">
          Go to course
        </Button>
      </Link>
    );
  }

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?from=/catalog/${slug}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isFree) {
        await api.post(`/enrollments/${courseId}/enroll`);
        router.push(`/learn/${slug}`);
      } else {
        const { data } = await api.post<{ checkoutUrl: string }>(`/enrollments/${courseId}/checkout`);
        window.location.href = data.checkoutUrl;
      }
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(typeof raw === 'string' ? raw : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleEnroll} disabled={loading}>
        {loading
          ? 'Please wait…'
          : isFree
            ? 'Enroll for free'
            : `Enroll — ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(parseFloat(price))}`}
      </Button>
      {error && <p className="text-xs text-[var(--rose)] text-center">{error}</p>}
      {!user && (
        <p className="text-xs text-[var(--fg-4)] text-center">Sign in required to enroll</p>
      )}
    </div>
  );
}
