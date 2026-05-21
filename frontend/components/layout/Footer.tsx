import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="brand-mark" />
          <span className="text-sm font-medium text-[var(--fg)]">LearnBuild</span>
        </div>
        <p className="text-xs text-[var(--fg-3)]">
          &copy; {new Date().getFullYear()} LearnBuild. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-[var(--fg-3)]">
          <Link href="/catalog" className="hover:text-[var(--fg)] transition-colors">
            Catalog
          </Link>
          <Link href="/auth/login" className="hover:text-[var(--fg)] transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
