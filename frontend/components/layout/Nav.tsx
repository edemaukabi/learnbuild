'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function Nav() {
  const { theme, setTheme } = useTheme();
  const { user, logout, isInstructor } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)] backdrop-blur-md"
      style={{ background: 'var(--chrome-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="brand-mark" />
          <span className="font-semibold text-[var(--fg)] tracking-tight">LearnBuild</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <Link
            href="/catalog"
            className="px-3 py-1.5 rounded-md text-sm text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[var(--card-2)] transition-all duration-[var(--t)]"
          >
            Catalog
          </Link>
          {isInstructor && (
            <Link
              href="/instructor"
              className="px-3 py-1.5 rounded-md text-sm text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[var(--card-2)] transition-all duration-[var(--t)]"
            >
              Teach
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--fg-3)] hover:text-[var(--fg)] hover:bg-[var(--card-2)] transition-all duration-[var(--t)]"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <BookOpen size={14} />
                  My Learning
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-[var(--fg-2)]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex flex-col gap-1">
          <Link href="/catalog" className="py-2 text-sm text-[var(--fg-2)]" onClick={() => setMenuOpen(false)}>
            Catalog
          </Link>
          {isInstructor && (
            <Link href="/instructor" className="py-2 text-sm text-[var(--fg-2)]" onClick={() => setMenuOpen(false)}>
              Teach
            </Link>
          )}
          <div className="border-t border-[var(--border)] mt-2 pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">My Learning</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="w-full">Sign out</Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Sign in</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
