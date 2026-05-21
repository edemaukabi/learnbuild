'use client';

import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFree = parseFloat(price) === 0;

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?from=/catalog/${slug}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isFree) {
        await api.post(`/courses/${courseId}/enroll`);
        router.push(`/learn/${slug}`);
      } else {
        const { data } = await api.post(`/courses/${courseId}/checkout`);
        window.location.href = data.checkoutUrl;
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Something went wrong. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleEnroll} disabled={loading}>
        {loading ? 'Please wait…' : isFree ? 'Enroll for free' : 'Enroll now'}
      </Button>
      {error && <p className="text-xs text-[var(--rose)] text-center">{error}</p>}
      {!user && (
        <p className="text-xs text-[var(--fg-4)] text-center">Sign in required to enroll</p>
      )}
    </div>
  );
}
