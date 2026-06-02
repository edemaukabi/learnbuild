'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-[var(--rose)] mt-1">
      <AlertCircle size={12} className="shrink-0" /> {msg}
    </p>
  );
}

function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(from);
  }, [user, router, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const newErrors = { email: '', password: '' };
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    if (newErrors.email || newErrors.password) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await login(email, password);
      router.push(from);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(typeof msg === 'string' ? msg : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--fg-2)]">Email</label>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
          placeholder="you@example.com"
          className={errors.email ? 'border-[var(--rose)] focus:border-[var(--rose)]' : ''}
        />
        <FieldError msg={errors.email} />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--fg-2)]">Password</label>
          <Link href="/auth/forgot-password" className="text-xs text-[var(--sky)] hover:text-[var(--sky-2)] transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
            placeholder="••••••••"
            className={`pr-10${errors.password ? ' border-[var(--rose)] focus:border-[var(--rose)]' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-3)] hover:text-[var(--fg-2)] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <FieldError msg={errors.password} />
      </div>

      {serverError && (
        <p className="text-xs text-[var(--rose)] bg-[var(--rose)]/10 border border-[var(--rose)]/20 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-xs text-[var(--fg-4)]">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-[var(--sky)] hover:text-[var(--sky-2)] transition-colors">
          Get started
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="brand-mark mx-auto mb-4" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <h1 className="text-xl font-bold text-[var(--fg)]">Welcome back</h1>
          <p className="text-sm text-[var(--fg-3)] mt-1">Sign in to continue learning</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
