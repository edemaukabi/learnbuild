'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const newErrors = { firstName: '', lastName: '', email: '', password: '' };
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (Object.values(newErrors).some(Boolean)) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await register({ firstName, lastName, email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      const raw =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw;
      setServerError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="brand-mark mx-auto mb-4" style={{ width: 36, height: 36, borderRadius: 10 }} />
          <h1 className="text-xl font-bold text-[var(--fg)]">Create your account</h1>
          <p className="text-sm text-[var(--fg-3)] mt-1">Start learning for free today</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--fg-2)]">First name</label>
                <Input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' })); }}
                  placeholder="Ada"
                  className={errors.firstName ? 'border-[var(--rose)] focus:border-[var(--rose)]' : ''}
                />
                <FieldError msg={errors.firstName} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--fg-2)]">Last name</label>
                <Input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' })); }}
                  placeholder="Lovelace"
                  className={errors.lastName ? 'border-[var(--rose)] focus:border-[var(--rose)]' : ''}
                />
                <FieldError msg={errors.lastName} />
              </div>
            </div>

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
              <label className="text-xs font-medium text-[var(--fg-2)]">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                  placeholder="Min. 8 characters"
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
              {loading ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-center text-xs text-[var(--fg-4)]">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[var(--sky)] hover:text-[var(--sky-2)] transition-colors">
                Sign in
              </Link>
            </p>

            <p className="text-center text-[10px] text-[var(--fg-4)] leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="text-[var(--fg-3)]">Terms of Service</span> and{' '}
              <span className="text-[var(--fg-3)]">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
