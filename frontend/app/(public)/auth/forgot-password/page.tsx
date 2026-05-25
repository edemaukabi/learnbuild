'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--teal-soft)] flex items-center justify-center mx-auto mb-5">
            <Mail size={26} className="text-[var(--teal)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--fg)]">Check your email</h1>
          <p className="text-sm text-[var(--fg-3)] mt-2 leading-relaxed">
            If <span className="text-[var(--fg)] font-medium">{email}</span> is registered,
            you&apos;ll receive a reset link shortly. It expires in 1 hour.
          </p>
          <p className="text-xs text-[var(--fg-4)] mt-3">
            Don&apos;t see it? Check your spam folder.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-[var(--sky)] hover:text-[var(--sky-2)] transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="brand-mark mx-auto mb-4" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <h1 className="text-xl font-bold text-[var(--fg)]">Forgot your password?</h1>
          <p className="text-sm text-[var(--fg-3)] mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--fg-2)]">Email address</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-[var(--rose)] bg-[var(--rose)]/10 border border-[var(--rose)]/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </Button>

            <p className="text-center text-xs text-[var(--fg-4)]">
              Remember it?{' '}
              <Link href="/auth/login" className="text-[var(--sky)] hover:text-[var(--sky-2)] transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
