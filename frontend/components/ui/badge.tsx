import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'sky' | 'teal' | 'amber' | 'rose' | 'default';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-medium',
        variant === 'sky' &&
          'bg-[var(--sky-soft)] text-[var(--sky)] border border-[var(--sky-edge)]',
        variant === 'teal' &&
          'bg-[var(--teal-soft)] text-[var(--teal-2)] border border-[var(--teal-edge)]',
        variant === 'amber' &&
          'bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber-edge)]',
        variant === 'rose' && 'bg-rose/10 text-rose border border-rose/30',
        variant === 'default' &&
          'bg-[var(--card-2)] text-[var(--fg-2)] border border-[var(--border-2)]',
        className,
      )}
      {...props}
    />
  );
}
